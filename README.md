# avatar
The avatar module for DrupalGap provides a UX for users to manage their Drupal profile picture.

Just provide a link to the `avatar` page path, and the user will be presented a form to manage their profile picture.

Make sure you're running the latest version of the `Services` module for Drupal.

## Render Array
```
content['my-picture'] = {
  theme: 'avatar',
  account: Drupal.user
};
```

## HTML String
```
var html = theme('avatar', { account: Drupal.user });
```

## Edit picture link
```
var html = bl(t('Edit picture'), 'avatar', { reloadPage: true } );
content['my-picture-edit-link'] = {
  markup: html
};
```

## Form action and options

By default when the user submits the avatar form it will update the user's picture and then wait for the user to navigate somewhere. You may choose which page to redirect to with form `action` and `action_options`.

```
/**
 * Implements hook_form_alter().
 */
function my_module_form_alter(form, form_state, form_id) {

  // When the user has updated their picture, send them back to their profile page and reload it.
  if (form_id == 'avatar_form') {
    form.action = 'user/' + Drupal.user.uid
    form.action_options = { reloadPage: true };
  }
  
}
```
