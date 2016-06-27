function theme_avatar(variables) {
  var mode = variables.mode ? variables.mode : 'default';
  var account = variables.account ? variables.account : Drupal.user;
  var options = {
    attributes: {
      class: 'avatar avatar-' + mode
    }
  };
  if (account.uid && account.picture && account.picture != '0') {
    options.path = drupalgap_image_path(account.picture.uri);
  }
  else if (drupalgap.settings.avatar && drupalgap.settings.avatar.defaultPicture) {
    options.path = drupalgap.settings.avatar.defaultPicture;
  }
  if (options.path) { return theme('image', options); }
  return '';
}

/**
 * Implements hook_menu().
 */
function avatar_menu() {
  var items = {};
  items['avatar'] = {
    title: 'Edit picture',
    page_callback: 'drupalgap_get_form',
    page_arguments: ['avatar_form']
  };
  return items;
}

function avatar_form(form, form_state) {

  form.elements.imageURI = {
    type: 'hidden',
    required: true
  };

  if (Drupal.user.picture) {

    // User has a picture...
    form.prefix = theme('avatar', { account: Drupal.user });
    drupalgap_toast(t('Sorry, this feature is not ready yet...'), 4000);

  }
  else {

    // User doesn't have a picture...
    form.prefix = '<div class="messages warning">' + t('No profile picture added.') + '</div>';

    form.elements.controls = {
      markup: '<div data-role="navbar">' +
      theme('item_list', {
        items: [
          l(t('Take a photo'), null, { attributes: { onclick: 'avatar_take_photo_onclick(this)' } }),
          l(t('Choose a photo'), null, { attributes: { onclick: 'avatar_choose_photo_onclick(this)' } })
        ]
      }) +
      '</div>'
    };

  }

  form.elements['submit'] = {
    type: 'submit',
    value: t('Save'),
    options: { attributes: {
      style: 'display: none;'
    } }
  };

  return form;
}

function avatar_form_submit(form, form_state) {

  // Warn developer if camera quality is potentially high.
  if (drupalgap.settings.camera.quality > 50) {
    console.log('WARNING - avatar - a value over 50 for drupalgap.settings.camera.quality may cause upload issues');
  }

  //console.log(form_state.values);
  var imageURI = form_state.values.imageURI;

  window.resolveLocalFileSystemURL(imageURI, function success(fileEntry) {

    //console.log("got file: " + fileEntry.fullPath);
    //console.log(fileEntry);

    avatarToDataUrl(fileEntry.nativeURL, function(base64){

      // Base64DataURL
      //console.log('got the 64');

      var data = {
        "file":{
          "file": base64.substring( base64.indexOf(',') + 1 ), // Remove the e.g. "data:image/jpeg;base64," from the front of the string.
          "filename": fileEntry.name,
          "filepath": "public://" + fileEntry.name
        }
      };

      // Upload it to Drupal to get the new file id...
      $('#edit-avatar-form-submit').text(t('Uploading...'));
      Drupal.services.call({
        method: 'POST',
        path: 'file.json',
        data: JSON.stringify(data),
        success: function(result) {

          //console.log(result);
          var fid = result.fid;

          // Load the file from Drupal...
          file_load(fid, {
            success: function(result) {

              //console.log(result);

              // Save their user account...
              var account = {
                uid: Drupal.user.uid,
                status: 1,
                picture_upload: result
              };
              user_save(account, {
                success: function(result) {

                  //console.log(result);

                  // Reload their user account.
                  user_load(Drupal.user.uid, {
                    success: function(account) {
                      Drupal.user = account;

                      // If a developer set a form action use it, otherwise just sit still.
                      if (form.action) {
                        var options = form.action_options ? form.action_options : null;
                        if (options) { drupalgap_goto(form.action, options); }
                        else { drupalgap_goto(form.action); }

                      }


                    }
                  });

                }
              });

            }
          });

        }
      });

    });

  }, function () {
    console.log('avatar had an accident, uh oh...');
  });

}

function avatar_replace_placeholder(uri) {
  $('#avatar_form .form_prefix img').attr('src', uri);
}

function avatar_show_submit_button() {
  $('#edit-avatar-form-submit').show('slow');
}

function avatar_success(imageURI, button) {
  avatar_replace_placeholder(imageURI);
  avatar_show_submit_button();
  $(button).removeClass('ui-btn-active');
  $('#edit-avatar-form-imageuri').val(imageURI);
}

function avatar_take_photo_onclick(button) {
  if (drupalgap.settings.mode == 'phonegap') {
    navigator.camera.getPicture(

        function(imageURI) {
          avatar_success(imageURI, button);
        },

        function(message) {
          if (message != 'Camera cancelled.') { drupalgap_alert(message); }
          $(button).removeClass('ui-btn-active');
        },

        {
          quality: drupalgap.settings.camera.quality,
          destinationType: Camera.DestinationType.FILE_URI,
          allowEdit: true,
          correctOrientation: true  //Corrects Android orientation quirks
        }
    );
  }
  else {
    var msg = 'Feature does not work in web app mode, yet...';
    if (Drupal.settings.debug) {
      drupalgap_toast(msg);
    }
    console.log(msg);
  }
}

function avatar_choose_photo_onclick(button) {
  if (drupalgap.settings.mode == 'phonegap') {
    navigator.camera.getPicture(

        function(imageURI) {
          avatar_success(imageURI, button);
        },

        function(message) {
          if (message != 'Selection cancelled.') { drupalgap_alert(message); }
          $(button).removeClass('ui-btn-active');
        },

        {
          quality: drupalgap.settings.camera.quality,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
          mediaType: Camera.MediaType.PICTURE,
          correctOrientation: true  //Corrects Android orientation quirks
        }
    );
  }
  else {
    var msg = 'Feature does not work in web app mode, yet...';
    if (Drupal.settings.debug) {
      drupalgap_toast(msg);
    }
    console.log(msg);
  }
}
