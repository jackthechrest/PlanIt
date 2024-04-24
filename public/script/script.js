let nav = 0;
let clicked = null;

const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const deleteEventModal = document.getElementById('deleteEventModal');
const backDrop = document.getElementById('modalBackDrop');
const eventTitleInput = document.getElementById('eventTitleInput');
const startHour = document.getElementById('startHour');
const startMinute = document.getElementById('startMinute');
const stopHour = document.getElementById('stopHour');
const stopMinute = document.getElementById('stopMinute');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function openModal(date) {
  clicked = date;

  // check if there is an event for that day
  // const eventForDay = events.find(e => e.date === clicked)
  const eventForDay = null;
  if (eventForDay) {
    console.log('Event already exists');
    deleteEventModal.style.display = 'block';
  } else {
    newEventModal.style.display = 'block';
  }

  backDrop.style.display = 'block';
}

function load() {
  const date = new Date();

  if (nav !== 0) {
    date.setMonth(new Date().getMonth() + nav);
  }

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  console.log(day);
  console.log(month);
  console.log(year);
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

  document.getElementById('monthDisplay').innerText = `${date.toLocaleDateString('en-us', {
    month: 'long',
  })} ${year}`;

  calendar.innerHTML = '';

  for (let i = 1; i <= paddingDays + daysInMonth; i++) {
    const daySquare = document.createElement('div');
    daySquare.classList.add('day');

    if (i > paddingDays) {
      daySquare.innerText = i - paddingDays;
      const dayString = `${month + 1}/${i - paddingDays}/${year}`;

      if (i - paddingDays === day && nav === 0) {
        daySquare.id = 'currentDay';
      }
      /* check for event
      if(event){
        const eventDiv = document.createElement('div');
        eventDiv.innerText = event title;
        daySquare.appendChild(eventDiv);
      }
      */
      daySquare.addEventListener('click', () => openModal(dayString));
    } else {
      daySquare.classList.add('padding');
    }
    calendar.appendChild(daySquare);
  }
}

function closeModal() {
  eventTitleInput.classList.remove('error');
  newEventModal.style.display = 'none';
  deleteEventModal.style.display = 'none';
  backDrop.style.display = 'none';
  eventTitleInput.value = '';
  startHour.value = '';
  startMinute.value = '';
  stopHour.value = '';
  stopMinute.value = '';
  /* locationInput.value = '';
  startTimeInput.value = '';
  stopTimeInput.value = ''; */
  clicked = null;
  load();
}

function saveEvent() {
  if (eventTitleInput.value) {
    eventTitleInput.classList.remove('error');
    startHour.classList.remove('error');
    startMinute.classList.remove('error');
    stopHour.classList.remove('error');
    stopMinute.classList.remove('error');

    console.log(startHour);
    const date = new Date();
    const showDate = new Date(date.getFullYear(), date.getMonth(), date.getDay());
    const showate = new Date(date.getFullYear(), date.getMonth(), date.getDay(), 2, 2);
    console.log(eventTitleInput, showDate, showate);
    registerEvent(eventTitleInput, showDate, showate);
    /*
    create event
    event{
      date: clicked,
      eventID: eventTitleInput.value
      startTime
      stopTime
      location
    }
    */
    closeModal();
  } else {
    eventTitleInput.classList.add('error');
    startHour.classList.add('error');
    startMinute.classList.add('error');
    stopHour.classList.add('error');
    stopMinute.classList.add('error');
  }
}

function deleteEvent() {
  // delete event
  closeModal();
}

function initButtons() {
  document.getElementById('nextButton').addEventListener('click', () => {
    ++nav;
    load();
  });

  document.getElementById('backButton').addEventListener('click', () => {
    --nav;
    console.log(nav);
    load();
  });
}

initButtons();
load();
