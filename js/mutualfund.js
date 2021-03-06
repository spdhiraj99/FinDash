var $j = jQuery.noConflict();

function switchLoaderVisibility(element) {
    var loader = document.getElementById(element);
    loader.classList.toggle('hideEle');
}

//to fetch data from api - GET
async function fetchData(url) {
    try {
        let res = await fetch(url);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

// to fetch data from API - POST
async function postData(url, body) {
    const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    };
    try {
        const fetchResponse = await fetch(url, settings);
        if (fetchResponse.status >= 400 && fetchResponse.status < 600) {
            throw new Error("Bad response from server");
        }
        if (fetchResponse.ok) {
            return true;
        }
    } catch (e) {
        return false;
    }
    return false;
}

// delete Mf From repo
async function deleteMf(id) {
    let url = `http://localhost:9090/v1/api/mutualfund/delete/` + id;
    let res = await fetch(url);
    if (res.status >= 400 && res.status < 600) {
        alert("couldn't delete, SERVER ERROR");
        return;
    }
    if (res.ok) {
        alert("Deleted");
        renderMfList("modify");
        return;
    }
}

// post data to add MF Record to repo
async function postDataToAddMf() {
    let mfName = document.getElementById('mfsearchText').value;
    let mfPurDate = document.getElementById('purchaseDate').value;
    mfPurDate = mfPurDate.split('-')[2] + '-' + mfPurDate.split('-')[1] + '-' + + mfPurDate.split('-')[0]
    let mfELper = document.getElementById('exLoadPer').value;
    let mfELDay = document.getElementById('exLoadDay').value;
    let mfEL = mfELper + ' ' + mfELDay;
    let investedAmt = document.getElementById('investedAmt').value;
    let fundId = document.getElementById('fundId').innerText;
    const mfData = {
        name: mfName,
        purchaseDate: mfPurDate,
        exitLoad: mfEL,
        lockPeriod: null,
        investedAmt: investedAmt,
        units: null,
        fundId: fundId
    }
    if (fundId != undefined && fundId != null && fundId.length > 0) {
        //fundId is there, can post, hide err if any
        document.getElementById('fundNameErr').classList.add('hideEle');
        let res = await postData('http://localhost:9090/v1/api/mutualfund/add', mfData);
        if (res === true) {
            //post successful remove error messages   
            document.getElementById('postError').classList.add('hideEle');
            document.getElementById('fundNameErr').classList.add('hideEle');
            $j('#addMf').modal('hide');
            alert('Added');
            renderMfeList();
        } else {
            //post failed, set error
            document.getElementById('postError').classList.remove('hideEle');
        }
    } else {
        //fundId not found, set error
        document.getElementById('fundNameErr').classList.remove('hideEle');
    }
}

// to render html for mf list Extended (consolidated mf List)
async function renderMfeList() {
    switchLoaderVisibility("loader");
    switchLoaderVisibility("listMfDiv");
    let url = 'http://localhost:9090/v1/api/mutualfund/details';
    const mfList = await fetchData(url);
    let i = 1;
    let renderHtml = ''
    let tableTop = `<div class="mfTable">
                      <table class="table table-primary table-hover mt-5">
                        <thead class="table-dark">
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Name</th>
                                <th scope="col">Invested Amount</th>
                                <th scope="col">units</th>
                                <th scope="col">current NAV</th>
                                <th scope="col">current Amount</th>
                                <th scope="col">UnRealized profit</th>
                                <th scope="col">Redeemable without tax</th>
                                <th scope="col">Redeemable with tax</th>
                                <th scope="col">STCG</th>
                                <th scope="col">LTCG</th>
                            </tr>
                        </thead>
                        <tbody>`

    let tableBottom = `</tbody>
                      </table>
                    </div>`

    renderHtml += tableTop
    mfList.forEach(mf => {
        let currentNav = mf.currentNav.toFixed(4);
        let profit = mf.profit.toFixed(2);
        let withdrawNoTax = (mf.withdrawNoTax).toFixed(2);
        let withdrawTax = (mf.withdrawTax).toFixed(2);
        let stcg = (mf.stcg).toFixed(2);
        let ltcg = (mf.ltcg).toFixed(2);
        let htmlChunk = `<tr>
                            <th scope="row">${i}</th>
                            <td>${mf.name}</td>
                            <td>??? ${mf.investedAmt}</td>
                            <td>${mf.units}</td>
                            <td>${currentNav}</td>
                            <td>??? ${mf.currentAmt}</td>`
        if (profit > 0)
            htmlChunk +=   `<td style="color:green">??? ${profit}</td>`
        else
            htmlChunk +=   `<td style="color:red">??? ${profit}</td>`
        htmlChunk +=       `<td>??? ${withdrawNoTax}</td>
                            <td>??? ${withdrawTax}</td>
                            <td>??? ${stcg}</td>
                            <td>??? ${ltcg}</td>
                        </tr>`
        renderHtml += htmlChunk
        i += 1;
    });

    renderHtml += tableBottom;
    let ele = document.getElementById("listMfDiv");
    switchLoaderVisibility("loader");
    switchLoaderVisibility("listMfDiv");
    ele.innerHTML = renderHtml;
}

// to render html for mf list
async function renderMfList(mode) {
    switchLoaderVisibility("loader");
    switchLoaderVisibility("listMfDiv");
    let url = 'http://localhost:9090/v1/api/mutualfund/info';
    const mfList = await fetchData(url);
    let i = 1;
    let renderHtml = ''
    let tableTop = `<div class="mfTable">
                      <table class="table table-primary table-hover mt-5">
                        <thead class="table-dark">
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Name</th>
                                <th scope="col">Purchase Date</th>
                                <th scope="col">Purchase Nav</th>
                                <th scope="col">Invested Amount</th>
                                <th scope="col">units</th>
                                <th scope="col">current Amount</th>`
    if (mode == "modify") {
        tableTop += `<th scope="col">Action</th>`
    }
    tableTop += `</tr>
                        </thead>
                        <tbody>`

    let tableBottom = `</tbody>
                      </table>
                    </div>`

    renderHtml += tableTop
    mfList.forEach(mf => {
        let currentAmt = parseFloat(mf.currentAmt).toFixed(2);
        let htmlChunk = `<tr>
                            <th scope="row">${i}</th>
                            <td>${mf.name}</td>
                            <td>${mf.purchaseDate}</td>
                            <td>${mf.purchaseNav}</td>
                            <td>??? ${mf.investedAmt}</td>
                            <td>${mf.units}</td>
                            <td>??? ${currentAmt}</td>`
        if (mode == "modify") {
            htmlChunk += `<td>
                                <button class="btn" onclick="deleteMf(`+ mf.id + `)"><i class="bi bi-trash"></i></button>
                            </td>`
        }
        htmlChunk += `</tr>`
        renderHtml += htmlChunk
        i += 1;
    });

    renderHtml += tableBottom;
    let ele = document.getElementById("listMfDiv");
    switchLoaderVisibility("loader");
    switchLoaderVisibility("listMfDiv");
    ele.innerHTML = renderHtml;
}

// search mutual fund with name
async function searchMfApi() {
    let valueToSearch = encodeURIComponent(document.getElementById('mfsearchText').value);
    let url = 'https://api.mfapi.in/mf/search?q=' + valueToSearch;
    const mfList = await fetchData(url);
    let renderHtml = '<div id = "search-list" class="search-list pt-2 height-collapsed">';
    mfList.forEach(mf => {
        renderHtml += '<a class="search-item" onclick="setFundId(this,' + mf.schemeCode + ')">' + mf.schemeName + '</a><br>';
    });
    renderHtml += '</div>';
    let ele = document.getElementById("suggestions");
    ele.innerHTML = renderHtml;
    if (mfList.length > 0) {
        animateHeight();
    }
}
// get the fundId from select
function setFundId(ele, value) {
    let fundName = document.getElementById("mfsearchText");
    fundName.value = ele.innerText;
    let fundId = document.getElementById("fundId");
    fundId.innerHTML = value;
    let searchList = document.getElementById('search-list');
    searchList.style.display = "none";
}

//animate height
function animateHeight() {
    let ele = document.getElementById('search-list');
    ele.classList.remove("height-collapsed");
    ele.classList.add("height-expanded");
}



// modal control
$j(document).on('shown.bs.modal', function (e) {
    $j('input:visible:enabled:first', e.target).focus();
    //set max date
    document.getElementById('purchaseDate').max = new Date().toISOString().split("T")[0];
    //control num field
    let investedAmt = document.getElementById("investedAmt");
    let exitLoadPer = document.getElementById("exLoadPer");
    let exLoadDay = document.getElementById('exLoadDay');
    const invalidChars = [
        "-",
        "+",
        "e",
    ];
    investedAmt.addEventListener("keydown", function (e) {
        if (invalidChars.includes(e.key)) {
            e.preventDefault();
        }
    });
    exitLoadPer.addEventListener("keydown", function (e) {
        if (invalidChars.includes(e.key)) {
            e.preventDefault();
        }
    });
    exLoadDay.addEventListener("keydown", function (e) {
        if (invalidChars.includes(e.key)) {
            e.preventDefault();
        }
    });
});