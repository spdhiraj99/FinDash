function switchLoaderVisibility(element) {
    var loader = document.getElementById(element);
    loader.classList.toggle('hideEle');
}

//to fetch data from api
async function fetchData(url) {
    try {
        let res = await fetch(url);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

// to render html for mf list
async function renderMfList() {
    switchLoaderVisibility("loader");
    switchLoaderVisibility("listMfDiv");
    let url = 'http://localhost:9090/v1/api/mutualfund/info';
    const mfList = await fetchData(url);
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
                                <th scope="col">current Amount</th>
                            </tr>
                        </thead>
                        <tbody>`

    let tableBottom = `</tbody>
                      </table>
                    </div>`

    renderHtml += tableTop
    mfList.forEach(mf => {
        let currentAmt = parseFloat(mf.currentAmt).toFixed(2);
        let htmlChunk = `<tr>
                            <th scope="row">${mf.id}</th>
                            <td>${mf.name}</td>
                            <td>${mf.purchaseDate}</td>
                            <td>${mf.purchaseNav}</td>
                            <td>₹ ${mf.investedAmt}</td>
                            <td>${mf.units}</td>
                            <td>₹ ${currentAmt}</td>
                        </tr>`
        renderHtml += htmlChunk
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
    if(mfList.length>0){
        animateHeight();
    }
}
// get the fundId from select
function setFundId(ele, value) {
    let fundName = document.getElementById("mfsearchText");
    fundName.value = ele.innerText;
    let fundId = document.getElementById("fundId");
    fundId.innerHTML=value;
    let searchList = document.getElementById('search-list');
    searchList.style.display = "none";
}

//animate height
function animateHeight(){
    let ele = document.getElementById('search-list');
    ele.classList.remove("height-collapsed");
    
    ele.classList.add("height-expanded");
}