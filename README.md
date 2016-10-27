# sails-ctrlinfo

Use async functions as sails controller, by adding some request|response descriptions.

## ctrlInfo(options)

```javascript
// Stateless service
UserService = {
  login(username, password) {
    // fake :)
    return Promise.resolve(true);  
  },
  ...
}

// Controller
UserController = {
  login: ctrlInfo({
    POST: {
      act: (apply) => apply.body(UserService.login, 'username', 'password'),
      view: (isLogin) => ['person/login', !isLogin ? { error: 'Failed' } : null],
      json: (isLogin) => ({isLogin})
    },
    GET: {
      view: () => ['person/login'],
    }
  }),
  ...
};
```
