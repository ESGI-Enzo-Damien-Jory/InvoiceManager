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

// Lazy-loaded controllers
const ClientsController = () => import('#controllers/clients_controller')
const ItemsController = () => import('#controllers/items_controller')

/*
|--------------------------------------------------------------------------
| Clients Routes
|--------------------------------------------------------------------------
*/
router
  .group(() => {
    router.get('/', [ClientsController, 'index'])
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
    router.post('/', [ItemsController, 'store'])
    router.put('/:id', [ItemsController, 'update'])
    router.delete('/:id', [ItemsController, 'destroy'])
  })
  .prefix('/api/items')
  .use(middleware.supabaseAuth())
