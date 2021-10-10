const formats = ['themedeck', 'standard', 'overall', 'expanded']
const info = {
  themedeck: {
    global: {
      id: '#globalRankTheme',
      pageID: '#globalRankPageTheme'
    },
    location: {
      id: '#locationRankTheme',
      pageID: '#locationRankPageTheme'
    }
  },
  standard: {
    global: {
      id: '#globalRankStandard',
      pageID: '#globalRankPageStandard'
    },
    location: {
      id: '#locationRankStandard',
      pageID: '#locationRankPageStandard'
    }
  },
  expanded: {
    global: {
      id: '#globalRankExpanded',
      pageID: '#globalRankPageExpanded'
    },
    location: {
      id: '#locationRankExpanded',
      pageID: '#locationRankPageExpanded'
    }
  },
  overall: {
    global: {
      id: '#globalRankOverall',
      pageID: '#globalRankPageOverall'
    },
    location: {
      id: '#locationRankOverall',
      pageID: '#locationRankPageOverall'
    }
  }
};
const timePeriods = {
  currentWeek: {
    label: 'Current Week',
    code: 'CurrentWeek'
  },
  lastWeek: {
    label: 'Last Week',
    code: 'LastCurrentWeek'
  },
  currentMonth: {
    label: 'Current Month',
    code: 'CurrentMonth'
  },
  lastMonth: {
    label: 'Last Month',
    code: 'LastCurrentMonth'
  },
  currentSeason: {
    label: 'Current Season',
    code: 'CurrentSeason'
  },
  lastSeason: {
    label: 'Last Season',
    code: 'LastCurrentSeason'
  }
};
const regions = {
  usAndCanada: {
    label: 'US and Canada',
    code: 5
  },
  europe: {
    label: 'Europe',
    code: 3
  },
  latinAmericaAndCaribbean: {
    label: 'Latin America and Caribbean',
    code: 4
  },
  oceania: {
    label: 'Oceania',
    code: 2
  },
  afticaMiddleEastAndIndia: {
    label: 'Africa, Middle East, and India',
    code: 1
  }
};
const countryCodes = {
  us: {
    label: 'United States',
    code: 'US'
  },
  au: {
    label: 'Australia',
    code: 'AU'
  },
  br: {
    label: 'Brazil',
    code: 'BR'
  },
  ca: {
    label: 'Canada',
    code: 'CA'
  },
  fr: {
    label: 'France',
    code: 'FR'
  },
  de: {
    label: 'Germany',
    code: 'DE'
  },
  it: {
    label: 'Italy',
    code: 'IT'
  },
  mx: {
    label: 'Mexico',
    code: 'MX'
  },
  es: {
    label: 'Spain',
    code: 'ES'
  },
  gb: {
    label: 'United Kingdom (Great Britain)',
    code: 'GB'
  }
};
let patchNotes = true;

function processResults(data, format, region) {
  $(info[format][region].id).removeClass();
  $(info[format][region].pageID).removeClass();
  if (data.error) {
    $(info[format][region].id).addClass('text-danger');
    $(info[format][region].pageID).addClass('text-danger');
    $(info[format][region].id).text('Error')
    $(info[format][region].pageID).text(data.error)
  } else if (data.end) {
    $(info[format][region].id).addClass('text-danger');
    $(info[format][region].pageID).addClass('text-danger');
    $(info[format][region].id).text('Not found');
    $(info[format][region].pageID).text(`Parsed all available pages: ${data.page}`);
  } else if (!data.rank && data.page) {
    $(info[format][region].id).addClass('text-danger');
    $(info[format][region].pageID).addClass('text-danger');
    $(info[format][region].id).text('Not found');
    $(info[format][region].pageID).text(`Parsed pages: ${data.page - 19} - ${data.page}`);
  } else {
    $(info[format][region].id).addClass('text-success');
    $(info[format][region].pageID).addClass('text-success');
    info[format][region].rank = data.rank;
    info[format][region].page = data.page;
    $(info[format][region].id).text(`${data.rank}`)
    $(info[format][region].pageID).text(`Found on page: ${data.page}`)
  }
}

function checkTrainerRank() {
  const username = $('#username').prop('value');
  // Region / Country Code Logic... uggh
  const location = $('#countrySelector').prop('value');
  console.log(location);
  let locationQuery;
  if (location.indexOf('region|') > -1) {
    locationQuery = `region=${location.split('|')[1]}`;
  } else if (location.indexOf('country|') > -1) {
    locationQuery = `countryCode=${location.split('|')[1]}`;
  }
  console.log(locationQuery);
  // Time period logic
  const timePeriod = $('#timePeriodSelector').prop('value');
  $('.location').text($('#countrySelection option:selected').text());
  for (let i = 0; i < formats.length; i += 1) {
    $(info[formats[i]].global.id).removeClass();
    $(info[formats[i]].global.pageID).removeClass();
    $(info[formats[i]].global.id).text('Finding...');
    $(info[formats[i]].global.pageID).text('')
    $(info[formats[i]].global.id).addClass('text-warning');
    $(info[formats[i]].global.pageID).addClass('text-warning');
    $.get(`/pokemonLookup/lookup?user=${username}&format=${formats[i]}&timePeriod=${timePeriod}&countryCode=global`, (data) => {
      processResults(data, formats[i], 'global')
    });
    $(info[formats[i]].location.id).removeClass();
    $(info[formats[i]].location.pageID).removeClass();
    $(info[formats[i]].location.id).text('Finding...');
    $(info[formats[i]].location.pageID).text('')
    $(info[formats[i]].location.id).addClass('text-warning');
    $(info[formats[i]].location.pageID).addClass('text-warning');
    $.get(`/pokemonLookup/lookup?user=${username}&format=${formats[i]}&timePeriod=${timePeriod}&${locationQuery}`, (data) => {
      processResults(data, formats[i], 'location')
    });
  }
}

function htmlOption(value, label) {
  return `<option value="${value}">${label}</option>`;
}

function handlePatchNotes() {
  if (!patchNotes) {
    patchNotes = true;
    $('#patchNotes').show();
  } else {
    patchNotes = false;
    $('#patchNotes').hide();
  }
}

$('#showPatchNotes').click(() => {
  handlePatchNotes();
});

function loadPage() {
  handlePatchNotes();
  const timePeriodKeys = Object.keys(timePeriods)
  for (let i = 0; i < timePeriodKeys.length; i += 1) {
    const html = htmlOption(timePeriods[timePeriodKeys[i]].code, timePeriods[timePeriodKeys[i]].label)
    $('#timePeriodSelector').append(html);
  }
  const regionKeys = Object.keys(regions);
  for (let i = 0; i < regionKeys.length; i += 1) {
    const html = htmlOption(`region|${regions[regionKeys[i]].code}`, regions[regionKeys[i]].label)
    $('#countrySelector').append(html);
  }
  const countryKeys = Object.keys(countryCodes);
  for (let i = 0; i < countryKeys.length; i += 1) {
    const html = htmlOption(`country|${countryCodes[countryKeys[i]].code}`, countryCodes[countryKeys[i]].label);
    $('#countrySelector').append(html);
  }
}

loadPage()
