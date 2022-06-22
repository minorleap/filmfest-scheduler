function appendImage(filmId, imageURL) {
  $(`#myModal-${filmId} .modal-dialog .modal-body .modal-image`).html("");
  $(`#myModal-${filmId} .modal-dialog .modal-body .modal-image`).append(`<img class="img-responsive" style="margin:0 auto;" src="${imageURL}">`);
}

function toggleSelected(element) {
  console.log(element.id);
  $(`#${element.id}-label`).toggleClass('btn-red').toggleClass('btn-blue');
}

function emailSchedule(address) {
  $.get('/schedule/email', function() {
    $('#email-button').toggleClass('btn-red').toggleClass('btn-blue').append(` Sent to ${address}`).prop('disabled', true);
  });
}

function trapSpaceKey(t,e){
  if ( e.which == 32 ) {
    e.preventDefault();
    t.click();
    t.focus();
  }
}

function markActiveNav() {
  if (window.location.pathname.includes('/schedule')) {
    $(`a[href^='${window.location.pathname}'] span`).addClass('btn-blue');
  }
}
