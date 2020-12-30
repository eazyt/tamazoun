$(function () { 
  
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
        console.log(data)
      },
      error: function (error) { 
        console.log(error)
      }
    })


  })
    
    







})