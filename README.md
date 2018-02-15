# Express Router Helper

### Before 😖

```js
const { Router } = require('express');

const router = Router();

router.get('/cats', getAllCats);

export default router;
```

### After 😎

```js
const { createRouter } = require('express-router-helper');

export default createRouter({
  prefix: 'cats',
  routes: [
    {
      path: '',
      method: 'GET',
      handler: getAllCats
    }
  ]
});

```

## LICENSE

MIT
