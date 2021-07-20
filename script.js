let rowNumberSection = document.querySelector(".row-number-section");

let formulaBarSelectedCellArea = document.querySelector(".selected-cell");

let formulaInput = document.querySelector(".formula-input-section");

let cellSection = document.querySelector(".cell-section")

let columnTagsSection = document.querySelector(".column-tag-section");

let lastCell;

let dataObj = {};

formulaInput.addEventListener("keydown", function(e){
  if (e.key == "Enter"){
    console.log("now evaluating formula");

    let typedFormula = e.currentTarget.value;
    console.log(typedFormula);

    if (!lastCell) return ;

    console.log("not returned");

    let selectedCellAdd = lastCell.getAttribute("data-address");
    let cellObj = dataObj[selectedCellAdd];

    cellObj.formula = typedFormula ;

    let upstream = cellObj.upstream ;

    for (let k = 0 ; k < upstream.length ; k++){
      removeFromDownstream(upstream[k], selectedCellAdd);
    }

    cellObj.upstream = [] ;
  }
});

cellSection.addEventListener("scroll", function (e) {
  rowNumberSection.style.transform = `translateY(-${e.currentTarget.scrollTop}px)`;

  columnTagsSection.style.transform = `translateX(-${e.currentTarget.scrollLeft}px)`;
});

for (let i = 1; i <= 100; i++) {
  let div = document.createElement("div");
  div.innerText = i;
  div.classList.add("row-number");
  rowNumberSection.append(div);
}


for (let i = 0; i < 26; i++) {
  let asciiCode = 65 + i;

  let reqAlphabet = String.fromCharCode(asciiCode);

  let div = document.createElement("div");
  div.innerText = reqAlphabet;
  div.classList.add("column-tag");
  columnTagsSection.append(div);
}

//inside this nested for loop we are creating individual cells UI + cell obj
for (let i = 1; i <= 100; i++) {
  let rowDiv = document.createElement("div");
  rowDiv.classList.add("row");
                       //i = 1 [A1,B1..........Z1]
                       //i = 2 []
                       //.
                       //.
                       //i = 100 [A100.........z100]

  for (let j = 0; j < 26; j++) {       //i = 100   j = 25  asciiCode = 65+25=90  alpha = z  cellAdd = Z100
    // A to Z
    let asciiCode = 65 + j;

    let reqAlphabet = String.fromCharCode(asciiCode);

    let cellAddress = reqAlphabet + i;

    dataObj[cellAddress] = {
      value : undefined ,
      formula : undefined ,
      upstream : [] ,
      downstream : [] ,
    };

    let cellDiv = document.createElement("div");

    cellDiv.addEventListener("input", function(e){
      // jis cell pr type kra uske attribute se maine uska cell address fetch kra
      let currCellAddress = e.currentTarget.getAttribute("data-address");

      //kuki sare cell objects dataObj me store ho rakhe h using their cell address as key
      //maine jis cell pr click krke type kra uska hi address fetch and uska hi object chahiye
      //to wo address as key use krke dataObj se fetch krlia req cellObj ko

      let currCellObj = dataObj[currCellAddress];

      currCellObj.value = e.currentTarget.innerText;


      // 1 -> Loop on Upstream
      // 2 -> for each cell go to its downstream and remove ourself
      // 3 -> apni upstream array ko empty kar le
      
      let currUpstream = currCellObj.upstream ;

      for (let k = 0 ; k < currUpstream.length ; k++){

        // removeFromDownstream(parent, child)

        removeFromDownstream(currUpstream[k], currCellAddress);
      }

      currCellObj.upstream = [] ;

      let currDownstream = currCellObj.downstream ;

      for (let i = 0 ; i < currDownstream.length ; i++){
        updateCell(currDownstream[i]);
      }

      
      dataObj[currCellAddress] = currCellObj ;

      console.log(dataObj);
    });

    cellDiv.setAttribute("contentEditable", true);

    cellDiv.classList.add("cell");

    cellDiv.setAttribute("data-address", cellAddress);

    cellDiv.addEventListener("click", function (e) {
        if (lastCell) {
          lastCell.classList.remove("cell-selected");
        }
  
        e.currentTarget.classList.add("cell-selected");
  
        lastCell = e.currentTarget;
  
        
  
        let currCellAddress = e.currentTarget.getAttribute("data-address")

        formulaBarSelectedCellArea.innerText = currCellAddress ;
  
  
    });

    rowDiv.append(cellDiv);
  }

  cellSection.append(rowDiv)

}



dataObj["A1"].value = 20;
dataObj["A1"].downstream = ["B1"];
dataObj["B1"].formula = "2 * A1";
dataObj["B1"].upstream = ["A1"];
dataObj["B1"].value = 40;

let a1cell = document.querySelector("[data-address='A1']")
let b1cell = document.querySelector("[data-address='B1']")

a1cell.innerText = 20
b1cell.innerText = 40


// C1 = Formula(2*A1)
// A1 = parent
// C1 = child

//is function kisi ki upstream se mtlb nhi hai
//iska bs itna kaam h ki parent do and child do , aur mai parent ki downstream se child ko hta dunga
//taki unke bichka connection khtm hojai
//taki agr parent update ho to connection khtm hone ke baad child update na ho

function removeFromDownstream(parentCell, childCell){

  // 1- Fetch parentCell's downstream

  let parentDownstream = dataObj[parentCell].downstream ;

  // 2- Filter kro childCell ko parent ki upstream se

  let filteredDownstream = [] ;

  for (let i = 0 ; i < parentDownstream.length ; i++){
    if (parentDownstream[i] != childCell){
      filteredDownstream.push(parentDownstream[i]);
    }
  }

  // 3- Filered upstream ko wapis save karwado dataObj mreq cell m

  dataObj[parentCell].downstream = filteredDownstream ;

}



function updateCell(cell){
  let cellObj = dataObj[cell];
  let upstream = cellObj.upstream ;
  let formula = cellObj.formula ;

  // upstream me jobhi cell hai unke objects me jaunga whase unki value lekr aunga
  // wo sari values mai ek object me key value pair form me store krunga where key being the cell address

  // {
  //   A1:20,
  //   B1:10
  // }

  let valObj = {};

  for (let i = 0 ; i < upstream.length ; i++){
    let cellValue = dataObj[upstream[i]].value ;

    valObj[upstream[i]] = cellValue ;
  }

  // hmare pas replace aur evaluate function hai 
  // nice, right??yay
  // a1 + b1

  for (let key in valObj){
    formula = formula.replace(key, valObj[key]);
  }

  // 20 + 10

  let newValue = eval(formula);

  dataObj[cell].value = newValue ;

  // updating new value on UI
  let cellOnUI = document.querySelector(`[data-address = '${cell}']`);
  cellOnUI.innerText = newValue;
  
  let downstream = cellObj.downstream;

  for (let i = 0 ; i < downstream.length ; i++){
    updateCell(downstream[i]);
  }

}