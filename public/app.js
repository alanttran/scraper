// Grab the articles as a json

$.getJSON("/articles", function(data) {
    console.log(data);
    if (data.length > 0) {
        console.log('data!');
        $("#articles").empty();
        for (var i = 0; i < data.length; i++) {
            // Display the apropos information on the page
            $("#articles").append("<div >" + "<p class='title is-4'><a href='" + data[i].link + "' target='_blank'>" + data[i].title + "</a></p><p class='subtitle is-6'>" + data[i].body + "</p><a class='js-article-link' data-id='" + data[i]._id + "' href='#'>Comment</a><div class='comment'></div><br></div>");
        }
    } else {
        console.log('no data!');
        $.ajax({
            method: "GET",
            url: "/scrape"

        }).done(function() {
            setTimeout(function() { location.reload(true); }, 5000);

        })
    }

});


// Whenever someone clicks a p tag
$(document).on("click", ".js-article-link", function() {
    console.log('js-article click!');
    // Empty the notes from the note section
    var link = $(this);

    $(this).next().empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
    console.log(thisId);
    // Now make an ajax call for the Article
    $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
        // With that done, add the note information to the page
        .done(function(data) {
            console.log(data);
            // The title of the article
            //$("#comment").append("<h2>" + data.title + "</h2>");
            // An input to enter a new title
            //$("#comment").append("<input id='titleinput' name='title' class='input' placeholder='Title'>");
            // A textarea to add a new note body
            link.next().append("<textarea id='bodyinput' name='body' class='textarea'></textarea>");
            // A button to submit a new note, with the id of the article saved to it
            link.next().append("<button class='button is-primary submit-comment' data-id='" + data._id + "'>Submit</button>");

            // If there's a note in the article
            if (data.comment) {
                // Place the body of the note in the body textarea
                $("#bodyinput").val(data.comment.body);
            }
        });
});

// When you click the savenote button
$(document).on("click", ".submit-comment", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    var textArea = $(this).prev();
    var commentContainer = $(this).parent();
    var link = commentContainer.prev();

    console.log('submit comment!');
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                // Value taken from note textarea
                body: textArea.val()
            }
        })
        // With that done
        .done(function(data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            commentContainer.empty();
            commentContainer.append("<div>" + textArea.val() + " <a class='delete-comment' href='#''><i data-id='" + thisId + "' class='fa fa-trash' aria-hidden='true'></i></a></div>")
        });

    // Also, remove the values entered in the input and textarea for note entry

    

});

$(document).on("click", ".fa-trash", function() {
    var thisId = $(this).attr("data-id");
    var commentContainer = $(this).parent().parent();
    var articleId = commentContainer.parent().prev().attr('data-id');
    console.log(commentContainer.parent().prev().attr('data-id'));

    $.ajax({
            method: "DELETE",
            url: "/comments/" + thisId,
        })
        // With that done
        .done(function(data) {
           commentContainer.empty();
           commentContainer.append("<textarea id='bodyinput' name='body' class='textarea'></textarea>");
   
           commentContainer.append("<button class='button is-primary submit-comment' data-id='" + articleId + "'>Submit</button>");

        });


});