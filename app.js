//no user is inserted at the beginning
let account = null;
//reference to html
const routes = {
    '/login': { templateId: 'login' },
    '/dashboard': {
      templateId: 'dashboard',
      init: updateDashboard
    },
};



function updateRoute() {
    const path = window.location.pathname;
    //server API base URL
    const route = routes[path];

    if (!route) {
        return navigate('/login');
    }

    const template = document.getElementById(route.templateId);
    const view = template.content.cloneNode(true);
    const app = document.getElementById('app');

    app.innerHTML = '';

    if (typeof route.init === 'function') {
      route.init(view);
    }

    app.appendChild(view);
}
//toFixed shows 2 decimal in balance of that account
function updateDashboard(view) {
  const viewModel = {
    ...account,
    formattedBalance: account.balance.toFixed(2)
  };

  bind(view, viewModel);
  //next there is a table to register one transaction in a row and another transaction in another row
  const template = document.getElementById('transaction');
  const table = view.querySelector("tbody");

  for (let transaction of account.transactions) {
    const row = template.content.cloneNode(true);
    const viewModel = {
      ...transaction,
      formattedAmount: transaction.amount.toFixed(2)
    };

    bind(row, viewModel);
    table.append(row);
  }

}

function bind(target, model) {
  for (let [ key, value ] of Object.entries(model)) {
    const selector = `[data-bind=${key}]`;
    const elements = target.querySelectorAll(selector);
    elements.forEach(element => { element.textContent = value });
  }
}

function navigate(path) {
    const location = path.startsWith('/') ? window.location.origin + path : path;
    window.history.pushState({}, path, location);
    updateRoute();
}
//The event.preventDefault() method stops the default action of an element from happening
function onLinkClick(event) {
    event.preventDefault();
    navigate(event.target.href);
}

async function register(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  const jsonData = JSON.stringify(data);
  const response = await createAccount(jsonData);

  account = response;
  navigate('/dashboard');
}

//sendRequest() function to regroup the code used in both createAccount() and getAccount()
async function sendRequest() {
  const response = await fetch('/api/accounts');
  return await response.json();
}

sendRequest(account);

//async function createAccount(account) {
  //const response = await fetch('/api/accounts', {
    //method: 'POST',
    //headers: { 'Content-Type': 'application/json' },
    //body: account
  //});

  //return await response.json();
//}

async function login(event) {
  event.preventDefault();
  const user = event.target.user.value;
  //const data = await getAccount(user);
  const data = await sendRequest(user);

  if (!data || data.error) {
    const message = data?.error || "An unknown error has occurred.";
    alert(message);
    return;
  }

  account = data;
  navigate('/dashboard');
}

sendRequest(user);

//async function getAccount(user) {
  //const response = await fetch('/api/accounts/' + encodeURIComponent(user));
  //return await response.json();
//}

window.onpopstate = () => updateRoute();
updateRoute();
