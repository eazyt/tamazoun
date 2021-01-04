$(function () { 
  // Stripe.setPublishableKey('pk_test_51I5WzSC61oZrgaYbxfGQSI84vxGbPLzOdNULJttjcirs3yNP8U1FHMxUrDco8woBTExVNhRjOY2NyGLrebstb0N400RV08QEPs')

    var opts = {
      lines: 13 // The number of lines to draw
        ,
      length: 27 // The length of each line
        ,
      width: 30 // The line thickness
        ,
      radius: 42 // The radius of the inner circle
        ,
      scale: 1 // Scales overall size of the spinner
        ,
      corners: 1 // Corner roundness (0..1)
        ,
      color: '#000' // #rgb or #rrggbb or array of colors
        ,
      opacity: 0.25 // Opacity of the lines
        ,
      rotate: 0 // The rotation offset
        ,
      direction: 1 // 1: clockwise, -1: counterclockwise
        ,
      speed: 1 // Rounds per second
        ,
      trail: 60 // Afterglow percentage
        ,
      fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
        ,
      zIndex: 2e9 // The z-index (defaults to 2000000000)
        ,
      className: 'spinner' // The CSS class to assign to the spinner
        ,
      top: '50%' // Top position relative to parent
        ,
      left: '50%' // Left position relative to parent
        ,
      shadow: false // Whether to render a shadow
        ,
      hwaccel: false // Whether to use hardware acceleration
        ,
      position: 'absolute' // Element positioning
    }
  
  $('#search').keyup(function() { 

    let search_term = $(this).val();

    $.ajax({
      method: 'POST',
      url: '/api/search',
      data: {
        search_term
      }, dataType: 'json',
      success: function (json) { 
        const data = json.hits.hits.map((hit) => {
          return hit;
        })
        $('#searchResults').empty();
        for (let i = 0; i < data.length; i++) { 
          let html = "";
          html += '<div class="col-md-4">';
          html += '<a href="/product/' + data[i]._source._id + '">';
          html += '<div class="thumbnail">';
          html += '<img src="' + data[i]._source.image + '">';
          html += '<div class="caption">';
          html += '<h3>' + data[i]._source.name + '</h3>';
          html += '<p>' + data[i]._source.category.name + '</p>';
          html += '<p>' + data[i]._source.price + '</p>';
          html += '</div></div></a></div>';

          $('#searchResults').append(html);
        }
      },
      error: function (error) { 
        console.log(error)
      }
    })
  })

  $(document).on('click', '#plus', function (e) { 
    e.preventDefault();
    let priceValue = parseFloat($('#priceValue').val());
    let quantity = parseInt($('#quantity').val());

    priceValue += parseFloat($('#priceHidden').val());
    quantity += 1;

    $('#quantity').val(quantity);
    $('#priceValue').val(priceValue.toFixed(2));
    $('#total').html(quantity);
  })
    

  $(document).on('click', '#minus', function (e) { 
    e.preventDefault();
    let priceValue = parseFloat($('#priceValue').val());
    let quantity = parseInt($('#quantity').val());

    if (quantity == 1) {
      priceValue = $('#priceHidden').val();
      quantity = 1;
    } else { 
      priceValue -= parseFloat($('#priceHidden').val());
      quantity -= 1;
    }


    $('#quantity').val(quantity);
    $('#priceValue').val(priceValue.toFixed(2));
    $('#total').html(quantity);
  })

// function stripeResponseHandler(status, res) {
//   var $form = $('payment-form')

  // if (res.error) {
  //   // show the errors on the form
  //   $form.find('payment-errors').text(res.error.message)
  //   $form.find('button').prop('disabled', false);
  // } else {
  //   // response contains id and card,which contains additional card details
  //   var token = res.id;
  //   // insert the token into form so it gets submitted to the server
  //   $form.append($('<input type="hidden" name="stripeToken" />').val(token));
  //   // and submit
  //   $form.get(0).submit()

  // }
  // };
  
  // $('#payment-form').submit(function (event) {
  //   var $form = $(this);

  //   // Disbale the submit button to prevent repeated clicks
  //   $form.find('button').prop('disabled', true);
  //   Stripe.card.createToken($form, stripeResponseHandler);

  //   // prevent the form from submitting with the default action
  //   return false;
  // });












// END OF TEH SCRIPT
})

