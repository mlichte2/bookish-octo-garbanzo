const defaultValue = `requestParams = {
  // see full list of possible params below
  // https://apiref.primer.io/reference/create_client_side_token_client_session_post
  orderId: "order-" + Math.random().toString(36).slice(2),
  currencyCode: "USD",
  // clientToken: "",
  customerId: null,
  customer: {
    emailAddress: "john@primer.io",
    billingAddress: {
      firstName: "John",
      lastName: "Doe",
      addressLine1: "2222 W Dickens Ave",
      addressLine2: "Unit 2",
      city: "Chicago",
      state: "IL",
      postalCode: "60647",
      countryCode: "US",
    },
  },
  order: {
    countryCode: "US",
    lineItems: [
      {
        itemId: "shoes-123",
        description: "Some nice shoes!",
        amount: 2222, // Amount should be in minor units!
        quantity: 1,
      },
    ],
  },
  paymentMethod: {vaultOnSuccess: true},
  metadata: {}
}



`;

// TODO add second tab for client session patch call https://codepen.io/Souleste/pen/xxwvVva

let built = false;

const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
  mode: "javascript",
  lineNumbers: true,
  autoCloseBrackets: true,
  matchBrackets: true,
  foldCode: true,
  theme: "dracula",
});
editor.setSize("800px", "650px");

editor.setValue(defaultValue);

// grabbing elements from DOM

const submitButton = document.getElementById("submit-button");
const payButton = document.getElementById("pay-button");
const patchButton = document.getElementById("patch-button");
const versionDropDown = document.getElementById("sdk-version-input");

// creating Global variables to be used later

let globalClientToken;
let globalUniversalCheckout;

// custom pay button logic

payButton.addEventListener("click", (e) => {
  e.preventDefault();
  globalUniversalCheckout.submit();
});

const convertStringToObject = (str) => {
  const code = eval(str);
  return code;
};

const changeCheckoutContainerBackground = () => {
  document.getElementById("checkout-container").style.backgroundColor = "white";
};

// function to update src of css and js files in the DOM
// currently not working -- I get a Primer not found error

const chooseVersion = () => {
  let version = versionDropDown.value;
  // document.getElementsByTagName("head")[0].appendChild(`
  // id="primer-css"
  // rel="stylesheet"
  // href="https://sdk.primer.io/web/${version}/Checkout.css"`);
  // document.getElementsByTagName("head")[0].appendChild(`
  // id="primer-script"
  // src="https://sdk.primer.io/web/${version}/Primer.min.js"
  // crossorigin="anonymous"`);

  const loadJsCssFile = (fileName, fileType) => {
    if (fileType == "js") {
      let fileRef = document.createElement("script");
      fileRef.setAttribute("crossorigin", "anonymous");
      fileRef.setAttribute("src", fileName);
      console.log(fileRef);
    } else if (fileType == "css") {
      let fileRef = document.createElement("link");
      fileRef.setAttribute("rel", "stylesheet");
      fileRef.setAttribute("type", "text/css");
      fileRef.setAttribute("href", fileName);
      console.log(fileRef);
    }

    if (typeof fileRef != "undefined")
      document.getElementsByTagName("head")[0].appendChild(fileRef);
  };

  loadJsCssFile(`https://sdk.primer.io/web/${version}/Primer.min.js`, "js");
  loadJsCssFile(`https://sdk.primer.io/web/${version}/Checkout.css`, "css");

  // const apiCSS = document.getElementById("primer-css");
  // const apiCDN = document.getElementById("primer-script");

  // apiCSS.setAttribute(
  //   "href",
  //   `https://sdk.primer.io/web/${version}/Checkout.css`
  // );
  // apiCDN.setAttribute(
  //   "src",
  //   `https://sdk.primer.io/web/${version}/Primer.min.js`
  // );

  console.log("Built using Primer Universal Checkout sdk version: ", version);
};

const checkIfPrimerBuilt = () => {
  if (built) {
    const checkoutContainer = document.getElementById("checkout-container");
    console.log(`tearing down ${globalUniversalCheckout}`);
    globalUniversalCheckout.teardown();
  }
};

const getCodeFromEditor = () => {
  const stringFromEditor = editor.getValue();
  const obj = convertStringToObject(stringFromEditor);
  return obj;
};

const buildPrimer = async (clientSession) => {
  console.log("Client Session:", clientSession);
  const { clientToken } = clientSession;
  console.log("Client Token:", clientToken);
  const universalCheckout = await Primer.showUniversalCheckout(clientToken, {
    container: "#checkout-container",
    submitButton: {
      // amountVisible: true,
      useBuiltInButton: false,
      // onVisible(isVisible) {
      //   payButton.disabled = !isVisible;
      // },
      onDisable(isDisabled) {
        console.warn(`payButton.isDisabled ${isDisabled}`);
        payButton.disabled = isDisabled;
      },
    },

    allowedCardNetworks: ["visa", "mastercard", "american-express"],
    locale: "en-US",
    style: null,
    // paymentHandling: "MANUAL",
    // card: {
    //   preferredFlow: "DEDICATED_SCENE", // Show the card form on a separate scene
    // },
    paypal: {
      paymentFlow: "PREFER_VAULT",
    },

    // onTokenizeSuccess(paymentMethodTokenData, handler) {
    //   console.log(paymentMethodTokenData);
    // },

    onCheckoutComplete({ payment }) {
      console.log(
        "Checkout Complete!",
        payment,
        `\n view at https://sandbox-dashboard.primer.io/payments/${payment.id}`
      );
      getPaymentInformation(payment.id);
    },
    onCheckoutFail(error, { payment }, handler) {
      console.log(
        "Checkout Failed :( ",
        payment,
        `\n view at https://sandbox-dashboard.primer.io/payments/${payment.id}`
      );
      getPaymentInformation(payment.id);
      return handler.showErrorMessage(error);
    },
  });
  built = true;
  globalClientToken = clientToken;
  globalUniversalCheckout = universalCheckout;
};

const DisableSubmitButton = () => {
  submitButton.disabled = true;
  console.log("ShowUniversalCheckout button disabled for 5 seconds...");
  setTimeout(function () {
    submitButton.disabled = false;
    console.log("ShowUniversalCheckout button enabled");
  }, 5000);
};

submitButton.addEventListener("click", async function (e) {
  e.preventDefault();
  DisableSubmitButton();
  chooseVersion();
  checkIfPrimerBuilt();
  const code = getCodeFromEditor();
  const response = await fetch("/client-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(code),
  }).then((data) => data.json());
  changeCheckoutContainerBackground();
  universalCheckout = await buildPrimer(response);
});

patchButton.addEventListener("click", async function (e) {
  e.preventDefault();
  // TODO check if universal checkout build function
  const code = getCodeFromEditor();
  const response = await fetch("/client-session", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(code),
  })
    .then((data) => data.json)
    .catch((err) => {
      console.log(err);
    });
  updateUniversalCheckout(globalClientToken);
});

const updateUniversalCheckout = (clientToken) => {
  globalUniversalCheckout.setClientToken(clientToken);
  console.log(globalClientToken, globalUniversalCheckout);
};

/*
requestParams = {
  // see full list of possible params below
  // https://apiref.primer.io/reference/create_client_side_token_client_session_post

  clientToken:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6ImNsaWVudC10b2tlbi1zaWduaW5nLWtleSJ9.eyJleHAiOjE2NjM5NjM5NjUsImFjY2Vzc1Rva2VuIjoiZjdkODg1ZDUtYzEzZC00NWVjLTljMWEtOWJlNDdkMmM1YjFlIiwiYW5hbHl0aWNzVXJsIjoiaHR0cHM6Ly9hbmFseXRpY3MuYXBpLnNhbmRib3guY29yZS5wcmltZXIuaW8vbWl4cGFuZWwiLCJhbmFseXRpY3NVcmxWMiI6Imh0dHBzOi8vYW5hbHl0aWNzLnNhbmRib3guZGF0YS5wcmltZXIuaW8vY2hlY2tvdXQvdHJhY2siLCJpbnRlbnQiOiJDSEVDS09VVCIsImNvbmZpZ3VyYXRpb25VcmwiOiJodHRwczovL2FwaS5zYW5kYm94LnByaW1lci5pby9jbGllbnQtc2RrL2NvbmZpZ3VyYXRpb24iLCJjb3JlVXJsIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5wcmltZXIuaW8iLCJwY2lVcmwiOiJodHRwczovL3Nkay5hcGkuc2FuZGJveC5wcmltZXIuaW8iLCJlbnYiOiJTQU5EQk9YIiwidGhyZWVEU2VjdXJlSW5pdFVybCI6Imh0dHBzOi8vc29uZ2JpcmRzdGFnLmNhcmRpbmFsY29tbWVyY2UuY29tL2NhcmRpbmFsY3J1aXNlL3YxL3NvbmdiaXJkLmpzIiwidGhyZWVEU2VjdXJlVG9rZW4iOiJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpJVXpJMU5pSjkuZXlKcWRHa2lPaUl6TWpVelpEUTNOQzAyT1RVNExUUTJaVFl0WW1WaE55MHpPRGt6TmpCa05UQmtaamdpTENKcFlYUWlPakUyTmpNNE56YzFOalVzSW1semN5STZJalZsWWpWaVlXVmpaVFpsWXpjeU5tVmhOV1ppWVRkbE5TSXNJazl5WjFWdWFYUkpaQ0k2SWpWbFlqVmlZVFF4WkRRNFptSmtOakE0T0RoaU9HVTBOQ0o5LmRDUjNoMnBlSVNwQ1BMMm02VTRfcDhpallWbmNNZUFwOHpwczZzYTZKV00iLCJwYXltZW50RmxvdyI6IkRFRkFVTFQifQ._GuoTx2T2FVUYPopRdoP4DSo48nYk_ppfzwXBqMjygM",

  order: {
    countryCode: "GB",
    lineItems: [
      {
        itemId: "shoes-123",
        description: "Some nice shoes!",
        amount: 2222, // Amount should be in minor units!
        quantity: 1,
      },
      {
        amount: 0,
        quantity: 1,
        discountAmount: 2000,
        itemId: "Voucher",
        description: "Discount",
      },
    ],
  },
};
*/

const getPaymentInformation = async (paymentId) => {
  const response = await fetch(`/search-payment?paymentId=${paymentId}`);
  const data = await response.json();
  console.log("payment information:", data);
};
