const defaultValue = `requestParams = {
  // see full list of possible params below
  // https://apiref.primer.io/reference/create_client_side_token_client_session_post
  orderId: "order-" + Math.random(),
  currencyCode: "EUR",
  customer: {
    emailAddress: "john@primer.io",
    billingAddress: {
      firstName: "John",
      lastName: "Doe",
      addressLine1: "123 Main St",
      addressLine2: "Apt #1",
      city: "San Francisco",
      state: "CA",
      postalCode: "94107",
      countryCode: "US",
    },
  },
  order: {
    lineItems: [
      {
        itemId: "shoes-123",
        description: "Some nice shoes!",
        amount: 2222,
        quantity: 1,
      },
    ],
  },
}`;

const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
  mode: "javascript",
  //   theme: "nord",
  lineNumbers: true,
  autoCloseBrackets: true,
  matchBrackets: true,
  foldCode: true,
});
editor.setSize("80%", "600px");

editor.setValue(defaultValue);

const submitButton = document.getElementById("submit-button");

const convertStringToObject = (str) => {
  const code = eval(str);
  return code;
};

submitButton.addEventListener("click", function (e) {
  e.preventDefault();
  const stringFromEditor = editor.getValue();
  const obj = convertStringToObject(stringFromEditor);
  console.log(obj, typeof obj);
  return obj;
});
