let visualAidData;
const YEAR_INDEX = 1;
const DONOR_INDEX = 2;
const AMOUNT_INDEX = 4;

async function getVisualData() { // waiting for the promise of fetch to return.
    await fetch('aidData.csv')
        .then(response => response.text())
        .then(csvData => {
            const rows = csvData.split('\n');  // Split by lines
            const data = rows.map(row => row.split(','));  // Split by commas

            // Log the parsed data
            visualAidData = data;
        })
        .catch(error => console.error('Error:', error));

    // Call 2 function (can be display simultaneously)
    displayVis1(visualAidData);
    displayVis2(visualAidData);

}

// Geo Map
function displayVis1(visualData) {
    google.charts.load('current', {
        'packages':['geochart'],
    });

    let vis1Data = parseVis1Data(visualAidData);
    console.log(vis1Data)

    const drawRegionsMap = () => {
        var data = google.visualization.arrayToDataTable(vis1Data);

        var options = {};
        var chart = new google.visualization.GeoChart(document.getElementById('gc-vis1'));

        chart.draw(data, options);
    }

    google.charts.setOnLoadCallback(drawRegionsMap);
}

function parseVis1Data(visualData) {
    console.log(visualAidData)
    let dataArray = [['Country', 'Donated Amount in USD']]
    let countriesArray = {}; // {country: donated_amount} ==> format

    // loop through visualData to updated countriesRepetitionCount
    for (var i = 2; i < visualData.length; i++) {
        const donor = visualData[i][DONOR_INDEX];
        const amount = parseInt(visualData[i][AMOUNT_INDEX]);

        // Sum up the total amount of that the country has donated
        if (!Object.keys(countriesArray).includes(donor)) {
            countriesArray[donor] = amount;
        } else {
            countriesArray[donor] += amount;
        }
    }
    console.log(countriesArray)

    let countryArray = [];
    Object.keys(countriesArray).map((country) => {
        countryArray = [country, countriesArray[country]];
        dataArray.push(countryArray);
    })

    return dataArray
}

// Combo Visualization | id=gc-vis2
function displayVis2(visualData) {
    google.charts.load('current', {'packages':['corechart']});

    const vis2Data = getVis2Data(visualData);

    const drawComboChart = () => {
        // Some raw data (not necessarily accurate)
        var data = google.visualization.arrayToDataTable(vis2Data);

        var options = {
            title: 'Comparing The Top 5 Most Frequently Donated Countries',
            vAxis: { title: 'Donation Frequency' },
            hAxis: { title: 'Years (1991-2010)' },
            seriesType: 'bars',
            series: { 5: { type: 'line' } }
        };

        var chart = new google.visualization.ComboChart(document.getElementById('gc-vis2'));
        chart.draw(data, options);
    }

    google.charts.setOnLoadCallback(drawComboChart);
}

function getVis2Data(visualData) {
    // const MOST_FREQUENT_DONATED_COUNTRIES = ['Germany', 'Japan', 'France', 'Spain', 'United States'];
    const countriesArray = [ 
        ['Year', 'France', 'Germany', 'Japan', 'Spain', 'United States', 'Average'],
        ['1991-1995'], 
        ['1995-2000'], 
        ['2000-2005'], 
        ['2005-2010'] ];
    const countriesRepetitionCount = {};

    // update the countriesRepetitionCount so it has this format: {country: [int, int, int, int]} for each selected countries
    for (let i=2; i<visualData.length; i++ ){
        const donor = visualData[i][DONOR_INDEX];

        if(countriesArray[0].includes(donor)){
            const year = parseInt(visualData[i][YEAR_INDEX]);
            let yearArray;

            if(!Object.keys(countriesRepetitionCount).includes(donor)){
                if (year <= 1995) { yearArray = [1, 0, 0, 0]}
                else if(year <= 2000) { yearArray = [0, 1, 0, 0]}
                else if(year <= 2005) { yearArray = [0, 0, 1, 0]}
                else if(year <= 2010) { yearArray = [0, 0, 0, 1]}

                countriesRepetitionCount[donor] = yearArray;
            }else{ // update the frequent donation from a donor country
                yearArray = countriesRepetitionCount[donor];

                if (year <= 1995) { yearArray[0] += 1}
                else if(year <= 2000) { yearArray[1] += 1}
                else if(year <= 2005) { yearArray[2] += 1}
                else if(year <= 2010) { yearArray[3] += 1}

                countriesRepetitionCount[donor] = yearArray;
            }
            
        }
    }

    // update the countriesArray
    for(let i=0; i<4; i++){
        const germanyFrequent = countriesRepetitionCount['Germany'][i];
        const japanFrequent = countriesRepetitionCount['Japan'][i];
        const franceFrequent = countriesRepetitionCount['France'][i];
        const spainFrequent = countriesRepetitionCount['Spain'][i];
        const usaFrequent = countriesRepetitionCount['United States'][i];
        const avgFrequent = (germanyFrequent + japanFrequent + franceFrequent + spainFrequent + usaFrequent) / 5;
        const frequentCountries = [franceFrequent, germanyFrequent, japanFrequent, spainFrequent, usaFrequent, avgFrequent]

        countriesArray[i+1] = [...countriesArray[i+1], ...frequentCountries];
    }
    return countriesArray;
}

