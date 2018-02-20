# Express Router Helper

## Setup

```sh
npm install express-router-helper
```

## Usage

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

### Validation 🆕

Express Router Helper - validation uses [Indicative](http://indicative.adonisjs.com/)

```js
const { createRouter } = require('express-router-helper');

export default createRouter({
  prefix: 'cats',
  routes: [
    {
      path: '',
      method: 'GET',
      validation: {
        body: {
          /** define rules & message */
        },
        headers: {
          /** define rules & message */
        },
        query: {
          sanitizes: {
            limit: 'to_int',
          },
          rules: {
            limit: 'required|integer|range:0,50',
            username: 'required|string|unique_username',
          },
          messages: {
            'limit.range': 'The {{field}} must be in range of 0 and 50.',
            unique_username: 'The username cannot be cathub.',
          },
        },
        options: {
          abortEarly: false,
          messages: {
            /** define global custom messages */
            required: 'Hey kiddo, the {{field}} field is required.',
            string: 'The {{field}} field must be a string.',
          },
          extends: [
            /** define global async or custom validations */
            { name: uniqueUsername.name, fn: uniqueUsername },
          ],
        },
      },
      handler: getAllCats
    }
  ]
});

// inside custom-validation-rules.js
export function uniqueUsername(data, field, message, args, get) {
  return new Promise((resolve, reject) => {
    /** @type {string} */
    const fieldValue = get(data, field);
    if (!fieldValue) return resolve('validation skipped'); // let required rule checks this.
    if (fieldValue.toLowerCase() !== 'cathub') {
      return resolve('validation skipped');
    } // let required rule checks this.
    return reject(message || 'CatHub username is taken.');
  });
}

```

## FAQ

1.  Sanitization will always run before validation.
2.  Will validate headers first, then query, and body last.

## LICENSE

MIT
