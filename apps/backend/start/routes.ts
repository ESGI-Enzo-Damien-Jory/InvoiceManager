/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router.get('/', async () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router.get('/', 'UsersController.show')
    router.put('/', 'UsersController.update')
  })
  .prefix('/api/user')
  .use(middleware.supabaseAuth)

router
  .group(() => {
    router.get('/', 'ClientsController.index')
    router.post('/', 'ClientsController.store')
    router.put('/:id', 'ClientsController.update')
    router.delete('/:id', 'ClientsController.destroy')
  })
  .prefix('/api/clients')
  .use(middleware.supabaseAuth)
