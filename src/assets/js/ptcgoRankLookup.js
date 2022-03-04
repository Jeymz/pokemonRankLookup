const formats = ['themedeck', 'standard', 'overall', 'expanded'];
const durations = {
  currentWeek: {
    label: 'Current Week',
    code: 'CurrentWeek'
  },
  lastCurrentWeek: {
    label: 'Previous Week',
    code: 'LastCurrentWeek'
  },
  currentMonth: {
    label: 'Current Month',
    code: 'CurrentMonth'
  },
  lastCurrentMonth: {
    label: 'Previous Month',
    code: 'LastCurrentMonth'
  },
  currentSeason: {
    label: 'Current Season',
    code: 'CurrentSeason'
  },
  lastCurrentSeason: {
    label: 'Last Season',
    code: 'LastCurrentSeason'
  }
};
let info;
const regions = {
  us: 'United States',
  au: 'Australia',
  br: 'Brazil',
  ca: 'Canada',
  dr: 'France',
  de: 'Germany',
  it: 'Italy',
  mx: 'Mexico',
  es: 'Spain',
  gb: 'United Kingdom (Great Britain)',
  5: 'US and Canada',
  3: 'Europe',
  4: 'Latin America and Caribbean',
  2: 'Oceania',
  1: 'Africa, Middle East, and India',
};
let id = 0;
let running = false;

// Lookup Logic Functions
function display(type, request, response) {
  let textClass = 'text-';
  let rankMessage;
  let secondaryMessage;
  if (type === 'error') {
    textClass += 'danger';
    rankMessage = 'Error';
    secondaryMessage = response.error;
  } else if (type === 'success') {
    textClass += type;
    rankMessage = response.rank;
    secondaryMessage = `Found on page ${request.page}`;
  } else if (type === 'danger') {
    textClass += type;
    rankMessage = 'Not ranked';
    secondaryMessage = `Searched all pages 1 - ${request.page}`;
  } else if (type === 'warning') {
    textClass += type;
    rankMessage = 'Loading...';
    if (response.lastSeenRank) {
      rankMessage = `Greater than ${response.lastSeenRank}`;
    }
    secondaryMessage = `Scanning page ${request.page + 1}`;
  }
  $(`#${request.regionLabel}${request.format}rank`).removeClass();
  $(`#${request.regionLabel}${request.format}page`).removeClass();
  $(`#${request.regionLabel}${request.format}rank`).addClass(textClass);
  $(`#${request.regionLabel}${request.format}page`).addClass(textClass);
  $(`#${request.regionLabel}${request.format}rank`).text(rankMessage);
  $(`#${request.regionLabel}${request.format}page`).text(secondaryMessage);
}

function processResult(request, response, cb) {
  if (response.error) {
    display('error', request, response);
  } else if (response.rank) {
    display('success', request, response);
  } else if (response.end) {
    display('danger', request, response);
  } else {
    display('warning', request, response);
    cb(request, processResult);
  }
}

function makeCall(request, cb) {
  let url = '/asyncLookup?';
  url += `username=${request.username}`;
  url += `&format=${request.format}`;
  url += `&region=${request.region}`;
  url += `&duration=${request.duration}`;
  url += `&page=${request.page + 1}`;
  request.page += 1;
  if (request.id !== info.id || !running) {
    return;
  }
  setTimeout(() => {
    $.get(url, (data) => {
      cb(request, data, makeCall);
    });
  }, request.page * 50);
}

function searchForUser() {
  info = {};
  id += 1;
  info.id = id;
  const username = $('#username').prop('value');
  const duration = $('#duration').prop('value');
  const page = 0;
  info.username = $('#username').prop('value');
  info.region = $('#regions').prop('value');
  $('.durationLabel').text($('#duration option:selected').text());
  $('.regionLabel').text($('#regions option:selected').text());
  info.duration = $('#duration').prop('value');
  for (let i = 0; i < formats.length; i += 1) {
    const format = formats[i];
    let region = $('#regions').prop('value');
    let regionLabel = 'region';
    makeCall({
      username,
      duration,
      id,
      page,
      format,
      region,
      regionLabel
    }, processResult);
    region = 'global';
    regionLabel = 'global';
    makeCall({
      username,
      duration,
      id,
      page,
      format,
      region,
      regionLabel
    }, processResult);
  }
}

// Page Load Logic Functions
function loadPage() {
  const durationKeys = Object.keys(durations);
  for (let i = 0; i < durationKeys.length; i += 1) {
    const html = `<option value=${durations[durationKeys[i]].code}>${durations[durationKeys[i]].label}</option>`;
    $('#duration').append(html);
  }
  const regionKeys = Object.keys(regions);
  for (let i = 0; i < regionKeys.length; i += 1) {
    let html;
    if (regionKeys[i] === 'us') {
      html = `<option value="${regionKeys[i]}" selected>${regions[regionKeys[i]]}</option>`;
    } else {
      html = `<option value="${regionKeys[i]}">${regions[regionKeys[i]]}</option>`;
    }
    $('#regions').append(html);
  }
}

// Search Button Handler
$('#newSearch').click(() => {
  if (running) {
    running = false;
    $('#newSearch').text('Lookup Ranks');
  } else {
    running = true;
    $('#newSearch').text('Stop Searching');
    searchForUser();
  }
});

// Load page
loadPage();
