const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const feelings = ['awful','bad','ok','good','great'];
const namesOfFeelings = ["freak", "whine", "sleep", "happy", "dancing"]
const moodColors = ["#6b2c2b","#b02c2c","#fe330b","#ffafb0","#fdd5e5"]

function generateImg(pet, device, feelIdx) {
  var _pet, _device, feel = namesOfFeelings[feelIdx];
  _pet = pet ? pet : "hanbunkotchi";
  _device = device ? device : "love";
  return `./assets/${_pet}/${feel}-${_device}.gif`
}

var smallJournalSaveButton = document.getElementById("journalSubmitButton")
var bigJournalSaveEditButton = document.getElementById("save")
var journalEditState = false
var journalEditState2 = false

var expandButton = document.getElementById("expandButton")
var cornerButton = document.getElementById("cornerButton")
var homeButton = document.getElementById("homeButton")
var helpButton = document.getElementById("helpButton")
var customizeButton = document.getElementById("customizeButton")
var exportButton = document.getElementById("exportButton")

var buttons = ["horrible", "bad", "ok", "good", "great"].map(
  function(mood){ return document.getElementById(mood) }
)

var miniHorribleButton = document.getElementById("miniAwful")
var miniBadButton = document.getElementById("miniBad")
var miniOkButton = document.getElementById("miniOk")
var miniGoodButton = document.getElementById("miniGood")
var miniGreatButton = document.getElementById("miniGreat")

var title = document.getElementById("currentDayHeader")
var subtitle = document.getElementById("yearHeader")
var headers = document.getElementsByClassName("headers")
var smallTextbox = document.getElementById("notes")
var largeTextbox = document.getElementById("largeJournal")
var yearChanger = document.getElementById("yearChanger")
var dayPreview = document.getElementById("dayPreview")
var moodImage = document.getElementById("image");
var yearDropdown = document.getElementById("year");
var petDropdown = document.getElementById("pet");
var deviceDropdown = document.getElementById("device");

var homePage = document.getElementById("HomeContent");
var calendarPage  = document.getElementById("calendarPage");
var journalPage = document.getElementById("journalPage");
var questionPage = document.getElementById("helpWindow");
var isQuestioning = false;
var customizingPage = document.getElementById("customizingWindow");
var isCustomizing = false;

var now = new Date()
var selectedDay = now.getDate() // range: 1-31
var selectedMonth = now.getMonth() + 1 // range: 1-12
var selectedYear = now.getFullYear()
var dateString;
var selectedEntry;

var userData = {};


function checkForUserData() {
  if(!userData) console.error("User data is undefined, failed to edit entry.")
}

//SWITCH PAGES
function goToHomePage(){
  for(var i = 0; i < headers.length; i++){
    headers[i].style.display = 'block'
  }
  dayPreview.style.display = 'none'
  homePage.style.display = 'block'
  calendarPage.style.display = 'none'
  journalPage.style.display = 'none'
  yearChanger.style.display = 'none'
}

function goToCalendarPage(){
  for(var i = 0; i < headers.length; i++){
    headers[i].style.display = 'none'
  }
  dayPreview.style.display = 'block'
  homePage.style.display = 'none'
  journalPage.style.display = 'none'
  calendarPage.style.display = 'block'
  yearChanger.style.display = 'block'
}

function goToJournalPage(){
  for(var i = 0; i < headers.length; i++){
    headers[i].style.display = 'block'
  }
  dayPreview.style.display = 'none'
  homePage.style.display = 'none'
  calendarPage.style.display = 'none'
  journalPage.style.display = 'block'
  yearChanger.style.display = 'none'
}

function toggleQuestionMark(){
  isQuestioning = !isQuestioning
  isCustomizing = false
  customizingPage.style.display = "none"

  if(isQuestioning){
    questionPage.style.display = "block"
  } else {
    questionPage.style.display = "none"
  }
}

function toggleCustomize(){
  isCustomizing = !isCustomizing
  isQuestioning = false
  questionPage.style.display = "none"

  if(isCustomizing){
    customizingPage.style.display = "block"
  } else {
    customizingPage.style.display = "none"
  }
}


//DATA I/O


function setData(key,value){
  console.log("Setting:" + key + " to " + typeof(value) + " of length " + value.length)
  let start = performance.now()
  chrome.storage.local.set({
    [key]: value
  }).then(() => {
    let end = performance.now()
    console.log(`Call to setData took ${end - start} milliseconds`)
  })
}

function getData(key,callback){
  var storageItem = chrome.storage.local.get(key);
  storageItem.then((data) => {
    if(data[key] === undefined){
      console.log("No data for key: " + key)
      callback("")
    } else {
      callback(data[key])
    }
  })
}

//Helpers

function saveSmallTextBox(){
  var text = smallTextbox.value
  editEntry(selectedYear,selectedMonth,selectedDay,null,text)
}

function saveBigTextBox(){
  var text = largeTextbox.value
  editEntry(selectedYear,selectedMonth,selectedDay,null,text)
}

function updateDate(year,monthNum,day){
  console.log("changing selected day to: " + year + " " + monthNum + " " + day)
  var now = new Date(year + "-" + monthNum + "-" + day)
  selectedDay = day
  selectedMonth = monthNum
  selectedYear = year
  var monthString = month[monthNum-1]
  dateString = monthString + " " + selectedDay + nth(selectedDay)

  title.textContent = dateString
  subtitle.textContent = selectedYear

}

function nth(i){
  if(i > 3 && i < 21) return "th"
  if(i % 10 == 3) return "rd"
  if(i % 10 == 2) return "nd"
  if(i % 10 == 1) return "st"
  return "th"
}

function getDateFromElement(element){
  d = element.className.replace( /[^\d.]/g, '' );
  m = element.parentElement.parentElement.parentElement.id.replace( /[^\d.]/g, '' );
  return [selectedYear,m,d]
}


function getOption(name){
  checkForUserData();
  return userData[name];
}

function editOption(name, deviceValue){
  checkForUserData();

  if(deviceValue !== null){
    userData[name] = deviceValue
  }
  setData(name, userData.device)
}

function getEntry(yearNum,monthNum,dayNum){
  checkForUserData();
  return userData[yearNum.toString()][monthNum-1][dayNum-1]
}

function editEntry(yearNum,monthNum,dayNum,moodId = null,journalText = null){
  console.log("Editing entry: " + yearNum + "-" + monthNum + "-" + dayNum + " Mood: " + moodId + " Journal: " + journalText)
  checkForUserData();

  if(moodId !== null && moodId >= 0 && moodId <= 4){
    var element = document.querySelector("#month_" + monthNum + " .date_" + dayNum)
    element.style['background-color'] = moodColors[moodId]
    userData[yearNum.toString()][monthNum-1][dayNum-1].mood = moodId
  }

  if(journalText === ""){
    userData[yearNum.toString()][monthNum-1][dayNum-1].entry = null
    journalText = null
  }
  if(journalText !== null){
    userData[yearNum.toString()][monthNum-1][dayNum-1].entry = journalText
  }
  setData("USER_DATA_" + yearNum,userData[yearNum])
}

function bigJournalChangeState(editting){
  console.log("journal editting state: " + editting)
  journalEditState = editting
  if(editting){
    //largeTextbox.readOnly = true
    largeTextbox.disabled = true
    largeTextbox.style['cursor'] = "not-allowed"
    bigJournalSaveEditButton.textContent = "edit"
    document.getElementById("moodOptions").style.display = 'none'
    document.getElementById("sentence").style.display = 'block'
    var todaysMood = document.getElementById("todayMood")
    if(selectedEntry.mood === null){
      document.querySelector('#sentence .moodSentence').textContent = "Today was ___"
      todaysMood.style.display = 'none'
    } else {
      todaysMood.style.display = 'block'
      document.querySelector('#sentence .moodSentence').textContent = "Today was " + feelings[selectedEntry.mood]
      todaysMood.style['background-color'] = moodColors[selectedEntry.mood]
    }
  } else {
    //largeTextbox.readOnly = false
    largeTextbox.disabled = false
    largeTextbox.style['cursor'] = "text"
    bigJournalSaveEditButton.textContent = "save"
    document.getElementById("moodOptions").style.display = 'block'
    document.getElementById("sentence").style.display = 'none'
  }
}

function smallJournalChangeState(editting){
  journalEditState2 = editting
  if(editting){
    smallTextbox.disabled = true
    smallTextbox.style['cursor'] = "not-allowed"
    smallJournalSaveButton.textContent = "edit"
  } else {
    smallTextbox.disabled = false
    smallTextbox.style['cursor'] = "text"
    smallJournalSaveButton.textContent = "save"
  }
}

function getDataForExport(year){
  var str = "";
  for(var monthNum = 1; monthNum <= month.length; monthNum++){
    var monthDays = new Date(year,monthNum,0).getDate()
    for(var dateNum = 1; dateNum <= monthDays; dateNum++){
      var entry = getEntry(year,monthNum,dateNum)
      str += year + "-" + monthNum + "-" + dateNum
      str += "\n"
      str += entry.entry || "No journal today."
      str += "\n"
      str += "feeling " + (feelings[entry.mood] || "N/A")
      str += "\n\n\n"
    }
  }
  return str
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

//EVENTS
function onDataLoaded(){
  smallTextbox.value = userData[selectedYear.toString()][selectedMonth-1][selectedDay-1].entry
  if(smallTextbox.value === ""){
    smallJournalChangeState(false)
  } else {
    smallJournalChangeState(true)
  }
  var now = new Date()
  selectedEntry = getEntry(now.getFullYear(),now.getMonth()+1,now.getDate())
  var moodToday = selectedEntry.mood === null ? 2 : selectedEntry.mood
  moodImage.style['background-image'] = "url(" + generateImg(userData.pet, userData.device, moodToday) + ")"
  buttons[moodToday].children[0].style.visibility = 'visible'
  buttons[moodToday].style.boxShadow = "0px 0px 0px 3px #C7B89F";
}

function onPageLoaded(){
  for(var i = 2022; i <= now.getFullYear()+1; i++){
    var e = document.createElement("option")
    e.value = i.toString()
    e.textContent = i.toString()
    yearDropdown.appendChild(e)
  }
  smallJournalChangeState(true)
  updateDate(selectedYear,selectedMonth,selectedDay)
}

function onSmallJournalSubmit(){
  if(!journalEditState2) saveSmallTextBox()
  if(smallTextbox.value == ""){
    smallJournalChangeState(false)
  } else {
    smallJournalChangeState(!journalEditState2)
  }
}

function onBigJournalSubmit(){
  if(journalEditState){
    bigJournalChangeState(false)
  } else {
    saveBigTextBox()
    bigJournalChangeState(true)
  }
}

function onJournalExpanded(){
  largeTextbox.value = smallTextbox.value
  bigJournalChangeState(true)
  goToJournalPage()
}

function onMoodPicked(moodId){
  checkForUserData();
  if(selectedDay == new Date().getDate()){
    moodImage.style['background-image'] = "url(" + generateImg(userData.pet, userData.device, moodId) + ")"
    var button = buttons[moodId]
    for(const i in buttons){
      buttons[i].style.boxShadow = null;
      buttons[i].children[0].style.visibility = null
    }
    button.children[0].style.visibility = 'visible'
    button.style.boxShadow = "0px 0px 0px 3px #C7B89F";
  }
  editEntry(selectedYear,selectedMonth,selectedDay,moodId)
}

function onMoodHover(moodId, leaving){
  if(leaving){
    console.log("mood: " + selectedEntry.mood)
    if(selectedEntry.mood <= 4 && selectedEntry.mood >= 0){
      moodImage.style['background-image'] = "url(" + generateImg(userData.pet, userData.device, selectedEntry.mood) + ")"
    } else {
      moodImage.style['background-image'] = "url(" + generateImg(userData.pet, userData.device, 2) + ")"
    }
  } else {
    moodImage.style['background-image'] = "url(" + generateImg(userData.pet, userData.device, moodId) + ")"
  }
}

function onCornerClicked(){
  goToCalendarPage()
}

function onHomeButtonClicked(){
  var now = new Date()
  updateDate(now.getFullYear(),now.getMonth()+1,now.getDate())
  selectedEntry = getEntry(now.getFullYear(),now.getMonth()+1,now.getDate())
  smallTextbox.value = selectedEntry.entry
  goToHomePage()
}

function onDateClicked(element){
  var today = new Date()
  today.setHours(23, 59, 59, 998);
  var date = getDateFromElement(element)
  if(new Date(date[0],date[1]-1,date[2]) > today) return
  updateDate(yearDropdown.options[yearDropdown.selectedIndex].text,date[1],date[2])
  selectedEntry = getEntry(date[0],date[1],date[2])
  largeTextbox.value = selectedEntry.entry
  bigJournalChangeState(true)
  goToJournalPage()
}

function onExportClicked(){
    download("my-" + selectedYear + "-year-in-review.txt", getDataForExport(selectedYear))
}

function onDateHover(element, left){
  var date = getDateFromElement(element)
  if(left){
    dayPreview.textContent = ""
    element.style.boxShadow = null;
    element.style['z-index'] = -1;
  } else {
    element.style.boxShadow = "0px 0px 0px 10px RGB(0,0,0,0.2) inset";
    dayPreview.textContent = month[date[1]-1] + " " + date[2]
  }
}


smallJournalSaveButton.addEventListener("click", onSmallJournalSubmit)
bigJournalSaveEditButton.addEventListener("click", onBigJournalSubmit)
expandButton.addEventListener("click", onJournalExpanded)
cornerButton.addEventListener("click",onCornerClicked)
homeButton.addEventListener("click",onHomeButtonClicked)
document.getElementById("journalPageGoBack").addEventListener("click", onHomeButtonClicked)
helpButton.addEventListener("click",toggleQuestionMark)
document.getElementById("helpWindowClose").addEventListener("click", toggleQuestionMark)
customizeButton.addEventListener("click", toggleCustomize)
document.getElementById("petWindowClose").addEventListener("click", toggleCustomize)
exportButton.addEventListener("click",onExportClicked)

miniHorribleButton.addEventListener("click",function(){ onMoodPicked(0)})
miniBadButton.addEventListener("click",function(){ onMoodPicked(1)})
miniOkButton.addEventListener("click",function(){ onMoodPicked(2)})
miniGoodButton.addEventListener("click",function(){ onMoodPicked(3)})
miniGreatButton.addEventListener("click",function(){ onMoodPicked(4)})

for(let i = 0; i < buttons.length; i++){
  buttons[i].addEventListener("click",function(){onMoodPicked(i)})
  buttons[i].addEventListener("mouseout", function(){onMoodHover(i,true)})
  buttons[i].addEventListener("mouseover", function(){onMoodHover(i,false)})
}

yearDropdown.addEventListener("change",function(event){
  changeYear(event.target.value)
})


petDropdown.addEventListener("change",function(event){
  editOption("pet", event.target.value)
})

deviceDropdown.addEventListener("change",function(event){
  editOption("device", event.target.value)
})

document.addEventListener("DOMContentLoaded", onPageLoaded);

window.addEventListener("unload", function(){
  setData("USER_DATA",userData)
})

//INITIALIZING STUFF

function setupPage(year){
  var today = new Date()
  today.setHours(23, 59, 59, 998);

  for(var monthNum = 1; monthNum <= month.length; monthNum++){
    var monthDays = new Date(year,monthNum,0).getDate()
    for(var dateNum = 1; dateNum <= 31; dateNum++){
      let element = document.querySelector("#month_" + (monthNum) + " .date_" + (dateNum))
      if(dateNum > monthDays){
        element.style['background-color'] = "transparent"
        element.style['border'] = "none"
        continue
      }

      element.addEventListener("mouseout", function(){onDateHover(element, true)})
      element.addEventListener("mouseover", function(){onDateHover(element, false)})

      if (new Date(selectedYear,monthNum-1,dateNum) > today){
        element.style['background-color'] = "#C7B89F"
        element.style['cursor'] = "not-allowed"
      } else {
        element.style['background-color'] = "#F1ECE3"
        element.style['cursor'] = "pointer"
        var moodId = userData[year][monthNum-1][dateNum-1].mood
        if(moodId !== null && moodId >= 0 && moodId <= 4) element.style['background-color'] = moodColors[moodId]
        element.addEventListener("click",function(){onDateClicked(element)})
      }
    }
  }
}

function changeYear(year){
  year = year.toString()
  selectedYear = year
  if(userData[year]){ // data exists in variable
    setupPage(year)
    onDataLoaded()
  } else {
    getData("USER_DATA_" + year,dataReceived)
    function dataReceived(data){
      if(data == ""){ // no previously saved data
        yearData = [];
        for(var monthNum = 0; monthNum < month.length; monthNum++){
          daysInMonth = new Date(year,monthNum+1,0).getDate()
          yearData[monthNum] = []
          for(var dayNum = 0; dayNum < daysInMonth; dayNum++){
            yearData[monthNum][dayNum] = {"entry":null,"mood":null}
          }
        }
        setData("USER_DATA_" + year,yearData)
        userData[year] = yearData;
        setupPage(year)
        onDataLoaded()
      } else {
        userData[year] = data;
        setupPage(year)
        onDataLoaded()
      }
    }
  }
}
changeYear(selectedYear)
