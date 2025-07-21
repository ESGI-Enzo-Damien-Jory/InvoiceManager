import { supabase } from '#start/supabase'

interface EmailData {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: string
    encoding: string
  }>
}

export async function sendInvoiceEmail(
  clientEmail: string,
  clientName: string,
  invoiceTitle: string,
  invoiceId: string,
  pdfUrl: string,
  isReminder: boolean = false,
  customMessage?: string,
  pdfBuffer?: Buffer,
  invoiceData?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const subject = isReminder
      ? `Rappel - Facture en attente: ${invoiceTitle}`
      : `Nouvelle facture: ${invoiceTitle}`

    const messageContent = customMessage ? `<p>${customMessage}</p><br>` : ''

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isReminder ? 'Rappel de facture' : 'Nouvelle facture'}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f9fafb;
            padding: 20px;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 32px 24px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          
          .header p {
            opacity: 0.9;
            font-size: 14px;
          }
          
          .content {
            padding: 32px 24px;
          }
          
          .greeting {
            font-size: 16px;
            margin-bottom: 24px;
            color: #374151;
          }
          
          .message {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
            font-size: 14px;
            color: #64748b;
          }
          
          .invoice-details {
            background-color: #f1f5f9;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
          }
          
          .invoice-details h3 {
            color: #1e293b;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .detail-label {
            color: #64748b;
            font-weight: 500;
          }
          
          .detail-value {
            color: #1e293b;
            font-weight: 600;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 500;
            font-size: 14px;
            margin: 24px 0;
            transition: all 0.2s ease;
          }
          
          .cta-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          
          .footer {
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 24px;
            text-align: center;
          }
          
          .footer p {
            color: #64748b;
            font-size: 12px;
            margin-bottom: 8px;
          }
          
          .company-name {
            color: #1e293b;
            font-weight: 600;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .status-sent {
            background-color: #dbeafe;
            color: #1d4ed8;
          }
          
          .status-overdue {
            background-color: #fee2e2;
            color: #dc2626;
          }
          
          .status-paid {
            background-color: #dcfce7;
            color: #16a34a;
          }
          
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
            
            .container {
              border-radius: 8px;
            }
            
            .header, .content, .footer {
              padding: 20px 16px;
            }
            
            .header h1 {
              font-size: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isReminder ? '🔔 Rappel de facture' : '📄 Nouvelle facture'}</h1>
            <p>Invoice Manager</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              Bonjour <strong>${clientName}</strong>,
            </div>
            
            ${messageContent}
            
            <div class="message">
              ${
                isReminder
                  ? 'Nous vous rappelons que vous avez une facture en attente de paiement. Veuillez la traiter dans les plus brefs délais.'
                  : 'Veuillez trouver ci-joint votre facture. Merci de votre confiance.'
              }
            </div>
            
            <div class="invoice-details">
              <h3>📋 Détails de la facture</h3>
              <div class="detail-row">
                <span class="detail-label">Titre :</span>
                <span class="detail-value">${invoiceTitle}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Numéro :</span>
                <span class="detail-value">#${invoiceId.substring(0, 8).toUpperCase()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Statut :</span>
                <span class="detail-value">
                  <span class="status-badge status-${invoiceData?.state?.toLowerCase() || 'sent'}">
                    ${invoiceData?.state || 'Sent'}
                  </span>
                </span>
              </div>
            </div>
            
            ${
              pdfUrl
                ? `
            <div style="text-align: center;">
              <a href="${pdfUrl}" class="cta-button">
                ${isReminder ? '👁️ Voir la facture' : '📥 Télécharger la facture'}
              </a>
            </div>
            `
                : ''
            }
            
            <div class="message" style="margin-top: 32px;">
              💬 Si vous avez des questions concernant cette facture, n'hésitez pas à nous contacter.
            </div>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement par</p>
            <p class="company-name">Invoice Manager</p>
            <p style="margin-top: 16px; font-size: 11px; color: #94a3b8;">
              © ${new Date().getFullYear()} Invoice Manager. Tous droits réservés.
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    // Prepare email data
    const emailData: any = {
      to: clientEmail,
      subject,
      html,
    }

    // Add PDF attachment if buffer is provided
    if (pdfBuffer) {
      emailData.attachments = [
        {
          filename: `${invoiceTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`,
          content: pdfBuffer.toString('base64'),
          encoding: 'base64',
        },
      ]
    } else if (pdfUrl) {
      // Fallback to URL if no buffer
      emailData.attachments = [
        {
          filename: `${invoiceTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`,
          content: pdfUrl,
          encoding: 'url',
        },
      ]
    }

    // Use Supabase's built-in email functionality
    const { error } = await supabase.functions.invoke('send-email', {
      body: emailData,
    })

    if (error) {
      console.error('Email sending failed:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Email service error:', err)
    return { success: false, error: err.message }
  }
}

export async function sendInvoiceReminder(
  clientEmail: string,
  clientName: string,
  invoiceTitle: string,
  invoiceId: string,
  pdfUrl: string,
  pdfBuffer?: Buffer,
  invoiceData?: any
): Promise<{ success: boolean; error?: string }> {
  return sendInvoiceEmail(
    clientEmail,
    clientName,
    invoiceTitle,
    invoiceId,
    pdfUrl,
    true,
    undefined,
    pdfBuffer,
    invoiceData
  )
}
