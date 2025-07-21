// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL =
    Deno.env.get('FROM_EMAIL') || 'Invoice Manager <contact@resend.dev>'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
        'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { to, subject, html, attachments } = await req.json()

        if (!RESEND_API_KEY) {
            throw new Error(
                'RESEND_API_KEY not configured. Please set it in your Supabase secrets.'
            )
        }

        // Préparer les données pour Resend
        const emailData: any = {
            from: FROM_EMAIL, // Adresse personnalisée Resend
            to: [to],
            subject,
            html,
        }

        // Ajouter les pièces jointes si présentes
        if (attachments && attachments.length > 0) {
            emailData.attachments = attachments.map((attachment: any) => ({
                filename: attachment.filename,
                content: attachment.content,
                encoding: attachment.encoding || 'base64',
            }))
        }

        console.log('Sending email to:', to)
        console.log('Subject:', subject)

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify(emailData),
        })

        if (!res.ok) {
            const errorData = await res.json()
            console.error('Resend API error:', errorData)
            throw new Error(
                `Email service error: ${errorData.message || res.statusText}`
            )
        }

        const data = await res.json()
        console.log('Email sent successfully:', data.id)

        return new Response(
            JSON.stringify({
                success: true,
                id: data.id,
                message: 'Email sent successfully',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error sending email:', error)

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
                details: 'Check your RESEND_API_KEY configuration',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            }
        )
    }
})
