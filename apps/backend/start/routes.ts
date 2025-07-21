/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| Define HTTP routes for your API using grouped prefixes and middleware.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const ProfilesController = () => import('#controllers/profiles_controller')
const ClientsController = () => import('#controllers/clients_controller')
const ItemsController = () => import('#controllers/items_controller')
const InvoicesController = () => import('#controllers/invoices_controller')
const InvoiceItemsController = () => import('#controllers/invoice_items_controller')

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/
router
  .group(() => {
    router.post('login', [AuthController, 'login'])
    router.post('register', [AuthController, 'register'])
    router.post('logout', [AuthController, 'logout']).use(middleware.supabaseAuth())
    router.post('reset', [AuthController, 'reset'])
    router.put('update', [AuthController, 'update']).use(middleware.supabaseAuth())
  })
  .prefix('/api/auth')

/*
|--------------------------------------------------------------------------
| Profiles Routes
|--------------------------------------------------------------------------
*/
router
  .group(() => {
    router.get('/', [ProfilesController, 'show'])
    router.put('/', [ProfilesController, 'update'])
    router.post('/avatar', [ProfilesController, 'uploadAvatar'])
  })
  .prefix('/api/profile')
  .use(middleware.supabaseAuth())
/*
|--------------------------------------------------------------------------
| Clients Routes
|--------------------------------------------------------------------------
*/
router
  .group(() => {
    router.get('/', [ClientsController, 'index'])
    router.get('/:id', [ClientsController, 'show'])
    router.post('/', [ClientsController, 'store'])
    router.put('/:id', [ClientsController, 'update'])
    router.delete('/:id', [ClientsController, 'destroy'])
  })
  .prefix('/api/clients')
  .use(middleware.supabaseAuth())

/*
|--------------------------------------------------------------------------
| Items Routes
|--------------------------------------------------------------------------
*/
router
  .group(() => {
    router.get('/', [ItemsController, 'index'])
    router.get('/:id', [ItemsController, 'show'])
    router.post('/', [ItemsController, 'store'])
    router.put('/:id', [ItemsController, 'update'])
    router.delete('/:id', [ItemsController, 'destroy'])
  })
  .prefix('/api/items')
  .use(middleware.supabaseAuth())

/*
|--------------------------------------------------------------------------
| Invoices Routes
|--------------------------------------------------------------------------
*/
router
  .group(() => {
    router.get('/', [InvoicesController, 'index'])
    router.get('/:id', [InvoicesController, 'show'])
    router.get('/:id/items', [InvoicesController, 'getItems'])
    router.post('/', [InvoicesController, 'store'])
    router.put('/:id', [InvoicesController, 'update'])
    router.delete('/:id', [InvoicesController, 'destroy'])
    router.get('/pdf/:id', [InvoicesController, 'download'])
    router.get('/preview/:id', [InvoicesController, 'preview'])
    router.post('/share/:id', [InvoicesController, 'generateSignedUrl'])
    router.post('/:id/generate-pdf', [InvoicesController, 'generatePdf'])
    router.post('/:id/send-email', [InvoicesController, 'sendEmail'])
    router.post('/:id/send-reminder', [InvoicesController, 'sendReminder'])
  })
  .prefix('/api/invoices')
  .use(middleware.supabaseAuth())

/*
|--------------------------------------------------------------------------
| Invoice Items Routes
|--------------------------------------------------------------------------
*/
router
  .group(() => {
    router.get('/:invoice_id/items', [InvoiceItemsController, 'index'])
    router.post('/items', [InvoiceItemsController, 'store'])
    router.put('/:invoice_id/items/:item_id', [InvoiceItemsController, 'update'])
    router.delete('/:invoice_id/items/:item_id', [InvoiceItemsController, 'destroy'])
  })
  .prefix('/api/invoices')
  .use(middleware.supabaseAuth())
