# avatar

The avatar module for DrupalGap provides a UX for users to manage their Drupal core profile picture.

Just provide a link to the `avatar` page path, and the user will be presented a form to manage their profile picture.

Make sure you're running the latest version of the `Services` module for Drupal, and the latest snapshots of `DrupalGap` and `jDrupal` inside your app.

Be careful when monitoring the console log for debug information, the avatar module may output too much to the console and freeze your browser.

## Drupal permissions

Make sure your desired user roles have permission to `Get own binary files` and `Save file information`.

## Edit picture link

```
var html = bl(t('Edit picture'), 'avatar', { reloadPage: true } );
content['my-picture-edit-link'] = {
  markup: html
};
```

It's recommended to always use the `reloadPage` option when navigating to the `avatar` form.

## Default user picture

It's nice to just display a generic picture for user's without a profile picture. That's possible with this simple config in your `settings.js` file:

```
drupalgap.settings.avatar = {

  defaultPicture: 'app/modules/custom/my_module/images/foo.png'

};
```

Easily render the user's profile picture with the avatar widget and/or theme function:

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
