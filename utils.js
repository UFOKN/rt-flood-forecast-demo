const TILE_LAYER = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const MAP_ATTRIBUTION = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
const MAP_ATTRIBUTION_PROVIDER = 'Flooding data &copy; <a href="https://ufokn.org">UFOKN</a>'
const API_ENDPOINT = 'https://2jla2kob4zasgzwg3auuhxoona0jkbdm.lambda-url.us-east-1.on.aws/v0/impacts'

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function getFileFromDate(date, hour) {
  let year = JSON.stringify(date.getYear()+1900)
  let month = date.getMonth()+1
  if (month < 10) {
    month = "0" + JSON.stringify(month)
  }
  else {
    month = JSON.stringify(month)
  }
  let day = date.getDate()
  if (day < 10) {
    day = "0" + JSON.stringify(day)
  }
  else {
    day = JSON.stringify(day)
  }
  let hour_string = (typeof hour == "string") ? hour : JSON.stringify(hour);
  if (1 == hour_string.length) {
    hour_string = "0" + hour_string;
  }
  return year + month + day + hour_string;
}
function getHourFromFile(datefile) {
  return datefile.substring(8,10)
}
function getDateFromFile(datefile) {
  return {
    'year': datefile.substring(0,4),
    'month': datefile.substring(4,6) - 1,
    'day': datefile.substring(6,8),
    'hour': getHourFromFile(datefile),
  }
}
function getDateObjFromFile(datefile) {
  let parts = getDateFromFile(datefile)
  return new Date(parts['year'], parts['month'], parts['day']);  
}

function formatDateFromFile(datefile) {

  if (datefile == undefined) {
    return 'Most Recent Prediction';
  }
  
  const date = getDateObjFromFile(datefile); 
  const hour =  getHourFromFile(datefile)
  const month = date.getMonth() + 1
  const year = date.getYear() + 1900
  const day = date.getDate()

  // Get the month name from the Date object
  const monthName = date.toLocaleString('default', { month: 'long' });

  // Return the formatted string
  return `${monthName} ${day}, ${year} ${hour}:00 GMT`;
}
function sortObjectByValues(obj) {
  // Convert the object into an array of key-value pairs
  const entries = Object.entries(obj);

  // Sort the array based on the values
  entries.sort((a, b) => b[1] - a[1]); 

  // Create a new object from the sorted array
  const sortedFips = [];
  entries.forEach(([key, value]) => {
    
    sortedFips.push(key);
  });
  return sortedFips;
}
function drawChart(myData, label){
  const ctx = document.getElementById('myChart');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(myData),
      datasets: [{
        label: '# of Impacts',
        data: Object.values(myData),
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      // Elements options apply to all of the options unless overridden in a dataset
      // In this case, we are setting the border of each horizontal bar to be 2px wide
      elements: {
        bar: {
          borderWidth: 2,
        }
      },
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Impacts - ' + label,
        }
      }
    }
  });
}

function getPreviousDay(date, hour) {
  let prev = new Date(date.getTime());
  prev.setDate(date.getDate() - 1);
  return getFileFromDate(prev, hour)
}
function getPreviousHour(date, hour) {
  if (hour == "00") {
    return getPreviousDay(date, 23)
  }
  return getFileFromDate(date, parseInt(hour)-1)
}
function getNextDay(date, hour) {
  let next = new Date(date.getTime());
  next.setDate(date.getDate() + 1);
  return getFileFromDate(next, hour)
}
function getNextHour(date, hour) {
  if (hour == "23") {
    return getNextDay(date, "00")
  }
  return getFileFromDate(date, parseInt(hour)+1)
}
function getLink(text, d, s) {
  let url = location.protocol + '//' + location.host + location.pathname + '?date=' + d
  if (undefined != s) {
    url = url + '&scope=' + s
  }
  return `<a href="${url}">${text}</a>`;
}