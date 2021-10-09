const formats = ['themedeck', 'standard', 'overall']
const info = {
  themedeck: {
    global: {
      id: '#globalRankTheme'
    },
    us: {
      id: '#usRankTheme'
    }
  },
  standard: {
    global: {
      id: '#globalRankStandard'
    },
    us: {
      id: '#usRankStandard'
    }
  },
  overall: {
    global: {
      id: '#globalRankOverall'
    },
    us: {
      id: '#usRankOverall'
    }
  }
};

function processResults(data, format, region) {
  if (data.error) {
    $(info[format][region].id).text(data.error)
  } else if (data.rank === 'Not found') {
    info[format][region].page = data.page;
    $(info[format][region].id).text(`Not found on pages ${data.page - 19} - ${data.page}`);
  } else {
    info[format][region].rank = data.rank;
    info[format][region].page = data.page;
    $(info[format][region].id).text(`${data.rank} - Found on page ${data.page}`)
  }
}

function checkTrainerRank() {
  const username = $('#username').prop('value');
  for (let i = 0; i < formats.length; i += 1) {
    $(info[formats[i]].global.id).text('Finding...')
    $.get(`/pokemonLookup/lookup?user=${username}&format=${formats[i]}&countryCode=global`, (data) => {
      processResults(data, formats[i], 'global')
    });
    $(info[formats[i]].us.id).text('Finding...');
    $.get(`/pokemonLookup/lookup?user=${username}&format=${formats[i]}&countryCode=us`, (data) => {
      processResults(data, formats[i], 'us')
    })
  }
}
