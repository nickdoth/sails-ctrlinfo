# sails-ctrlinfo

Use async functions as sails controller, by adding some request|response descriptions.

## ctrlInfo(options)

```javascript
// Stateless service
UserService = {
  login(username, password) {
    return User.find({ ... }).then(user => {
      delete user.password;
      return user;
    });
  },
  ...
}

// Controller
UserController = {
  login: ctrlInfo({
    POST: {
      act: (req) => apply.body(UserService.login, 'username', 'password'),
      view: (user) => ['person/login', !user ? { error: 'Failed' } : null],
      json: (user) => ({user}),
      sessionReplace: (user) => ({ uid: user.id, name: user.name })
    },
    GET: {
      view: () => ['person/login'],
    }
  }),
  ...
};
```
