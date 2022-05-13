const defaultValue = `requestParams = {
  // see full list of possible params below
  // https://apiref.primer.io/reference/create_client_side_token_client_session_post
  orderId: "order-" + Math.random(),

  // 3-character Currency Code used for all the amount of this session
  currencyCode: "USD",

  // amount: 2222, // if not using line items pass an amount 

  // customer information
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
    // country code -- useful for displaying different payment methods
    countryCode: "US",

    // Line items for this session
    // If your checkout does not have line items:
    //  > Pass a single line item with the total amount!
    lineItems: [
      {
        itemId: "shoes-123",
        description: "Some nice shoes!",
        amount: 2222, // Amount should be in minor units!
        quantity: 1,
      },
    ],
  },
}`;

let built = false;

const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
  mode: "javascript",
  lineNumbers: true,
  autoCloseBrackets: true,
  matchBrackets: true,
  foldCode: true,
});
editor.setSize("90%", "600px");

editor.setValue(defaultValue);

const submitButton = document.getElementById("submit-button");

const convertStringToObject = (str) => {
  const code = eval(str);
  return code;
};

submitButton.addEventListener("click", async function (e) {
  e.preventDefault();
  if (built) {
    const checkoutContainer = document.getElementById("checkout-container");
    checkoutContainer.innerHTML = "";
    // built = !built;
  }
  const stringFromEditor = editor.getValue();
  const obj = convertStringToObject(stringFromEditor);
  const response = await fetch("/client-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Version": "2021-10-19",
    },
    body: JSON.stringify(obj),
  }).then((data) => data.json());
  buildPrimer(response);
});

const buildPrimer = async (clientSession) => {
  console.log("Client Session:", clientSession);

  const { clientToken } = clientSession;

  console.log(clientToken);

  const universalCheckout = await Primer.showUniversalCheckout(clientToken, {
    container: "#checkout-container",
    onCheckoutComplete({ payment }) {
      console.log("Checkout Complete!", payment);
    },
    onCheckoutFail(error, { payment }, handler) {
      if (!handler) {
        return;
      }
      console.log(error);
      return handler.showErrorMessage(error);
    },
  });
  built = true;
};
