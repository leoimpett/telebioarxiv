var months = [
  "Gen",
  "Feb",
  "Mar",
  "Apr",
  "Mag",
  "Giu",
  "Lug",
  "Ago",
  "Set",
  "Ott",
  "Nov",
  "Dic"
];
var days = ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa"];

document.addEventListener("DOMContentLoaded", function(e) {

function tick() {
  var currTime = new Date();
  var currMin;
  var currHour;

  //leading zeroes
  if (String(currTime.getMinutes()).length == 1) {
    currMin = "0" + String(currTime.getMinutes());
  } else {
    currMin = String(currTime.getMinutes());
  }

  if (String(currTime.getHours()).length == 1) {
    currHour = "0" + String(currTime.getHours());
  } else {
    currHour = String(currTime.getHours());
  }

  document.getElementById("date_header").innerHTML =
    "<span class='hidespan'>TELEBIOARXIV</span> " + 
    days[currTime.getDay()] +
    " " +
    currTime.getDate() +
    " " +
    months[currTime.getMonth()] +
    " <span class='hidespan'>" +
    currHour +
    ":" +
    currMin +
    ":" +
    currTime.getSeconds().toString().padStart(2,'0') + "</span>";
}

var secondCheck = setInterval(tick, 1000);

telPages = {}
currentPageN = 100

function getBioArxivArticles(){
  var currTime = new Date();
  currTime.setDate(currTime.getDate()-1);
  date_query = currTime.getFullYear().toString() + '-' + currTime.getMonth().toString().padStart(2,'0') + '-' + currTime.getDate().toString();
  date_query = date_query + "/" + date_query;
  query_url = "https://api.biorxiv.org/details/biorxiv/" + date_query + "/0";




  // Get the articles - json format from query_url 
  $.getJSON(query_url, function(data) {
    var items = [];
    // console.log(data.collection)

    // First sort the data by data.collection.entry.category
    data.collection.sort((a, b) => b.category.localeCompare(a.category));

    const preferredCategories = ["developmental biology", "cell biology", "biophysics", "zoology"];

    const sortCategories = (a, b) => {
      const aIndex = preferredCategories.indexOf(a.category);
      const bIndex = preferredCategories.indexOf(b.category);
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      } else if (aIndex !== -1) {
        return -1;
      } else if (bIndex !== -1) {
        return 1;
      } else {
        return a.category.localeCompare(b.category);
      }
    };
    
    data.collection.sort(sortCategories);
    const dataStart = data.collection.slice(0, 10);

    pageN = 199;
    $.each(dataStart, function(key, value) {
      pageN = pageN + 1;
      // console.log(key, value)
      items.push(`
      <a href='#${pageN}'> 
      <div class='listleft' id='${pageN}'>
      ${value.title} - ${value.author_corresponding}
      <span class="category">${value.category}</span>
    </div> 
    <div class='listright'>
    ${pageN}
    </div>
    </a>`


      );
    });

    $( "<div>"  , {
      class: "my-new-list",
      html: items.join("")
    }).appendTo("#contents");

    // set #loading to display none
    $('#loading').text("")

  // Save #index_view as page 100
  // set timeout to do this so the above has time to work
  setTimeout(function(){ 
    telPages[100] = $('#index_view').html();
    setPage(100);
  }, 500)

    // Now add the full text view to telPages
    pageN = 199;
    $.each(data.collection, function(key, value) {
      pageN = pageN + 1;
      // two random integers from 1 to 8
      // make sure they are not teh same integer
      const articlePage = ` <h1 class="top_header ${value.category.replace(" ","")}"> ${value.category} </h1>
      <div id="article_box" >



      <h2> <a href="https://doi.org/${value.doi}" target="_blank"> ${value.title} </a> </h2>
      <h3 id="article_header" >${value.authors}</h3>
      <h4> ${value.author_corresponding_institution} </h4><hr>
      <div id="article_contents">
      <p>${value.abstract}</p>
      </div>
    </div>`



    telPages[pageN] = articlePage;

    });




  });


}


function setPage(pageN){

  // if setPage is a string make it a number
  if (typeof pageN === 'string') {
    pageN = Number(pageN)
  }

  console.log(pageN)
  if (pageN in telPages){
    $('#index_view').html("");
    $('#index_view').html(telPages[pageN]);
    
    $('#page_number').text(pageN.toString())
    // set current page number
    currentPageN = Number(pageN)

    // update 3 hrefs: green to the previous page, yellow to the next, and blue to a random one. 
    // get all indices of telPages
    const allIndices = Object.keys(telPages).map(Number)
    // sort them
    allIndices.sort(function(a, b){return a-b});
    // get the index of the current page
    const currIndex = allIndices.indexOf(currentPageN)
    // get the previous page
    prevPage = allIndices[currIndex - 1]
    // get the next page
    nextPage = allIndices[currIndex + 1]

    // IF currIndex is zero or last index, then set prevPage as the last index and nextPage as the first index
    if (currIndex == 0){
      prevPage = allIndices[allIndices.length - 1]
    }
    if (currIndex == allIndices.length - 1){
      nextPage = allIndices[0]
    }


    // get a random page
     randPage = allIndices[Math.floor(Math.random() * allIndices.length)];
    // if the random page is the same as the current page, then get a new random page
    while (randPage == currentPageN){
      randPage = allIndices[Math.floor(Math.random() * allIndices.length)];
    }



    // set href of #green 
    $('#green').attr('href', '#' + prevPage.toString())
    // set href of #yellow
    $('#yellow').attr('href', '#' + nextPage.toString())
    // set href of #blue
    $('#blue').attr('href', '#' + randPage.toString())


  }
  else{
    // after 100 miliseconds reset the number to currentPageN
    setTimeout(function(){
      $('#page_number').text(currentPageN.toString())
    }, 100);
  }

}

// set keyboard listener
document.addEventListener('keydown', function(event) {
  // if key is a number
  if (event.keyCode >= 48 && event.keyCode <= 57) {
    const origText = $('#page_number').text()
    const nDigits = origText.length;

    // if already 3 digits, then delete what is there
    if (nDigits == 3) {
      $('#page_number').text( event.key) ;
    }

    // if already only 1 digit, then add the new digit
    else if (nDigits == 1) {
      $('#page_number').text( origText + event.key) ;
    }

    // if already 2 digits, then add the new digit and call setPage
    else if (nDigits == 2) {
      $('#page_number').text( origText + event.key) ;
      setPage($('#page_number').text(), origText)
    }


  }
  // else if key is left or right arrow
  else if (event.keyCode == 37 || event.keyCode == 39) {
    // if left then setPage(currentPageN - 1)
    if (event.keyCode == 37) {
      // get previous page from green href 
      const prevPage = $('#green').attr('href').substring(1)
      setPage(prevPage)
    }
    // if right then setPage(currentPageN + 1)
    else if (event.keyCode == 39) {
      // get next page from yellow href 
      const nextPage = $('#yellow').attr('href').substring(1)
      setPage(nextPage)
    }
  }
})


getBioArxivArticles();




$(window).on('hashchange', function(e){
  // get new url
  var newUrl = window.location.hash.substring(1);
  console.log(newUrl)
  setPage(Number(newUrl))
});






  
});

