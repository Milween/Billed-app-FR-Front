/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import { localStorageMock } from "../__mocks__/localStorage.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store.js";
import BillsUI from "../views/BillsUI.js";
import { ROUTES } from "../constants/routes.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBillForm = screen.getByTestId("form-new-bill");
      expect(newBillForm).toBeTruthy();
    });

    test("Then it should render 8 entries", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const expenseTypeInput = screen.getByTestId("expense-type");
      expect(expenseTypeInput).toBeTruthy();

      const expenseNameInput = screen.getByTestId("expense-name");
      expect(expenseNameInput).toBeTruthy();

      const datePicker = screen.getByTestId("datepicker");
      expect(datePicker).toBeTruthy();

      const amountInput = screen.getByTestId("amount");
      expect(amountInput).toBeTruthy();

      const vatInput = screen.getByTestId("vat");
      expect(vatInput).toBeTruthy();

      const pctInput = screen.getByTestId("pct");
      expect(pctInput).toBeTruthy();

      const commentary = screen.getByTestId("commentary");
      expect(commentary).toBeTruthy();

      const fileInput = screen.getByTestId("file");
      expect(fileInput).toBeTruthy();
    });
  });
  describe("when I add an image file as bill proof", () => {
    test("then this new file should have been changed un the input", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTE({ pathname });
      };

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBills = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn((e) => newBills.handleChangeFile);
      const fileInput = screen.getByTestId("file");

      fileInput.addEventListener("change", handleChangeFile);
      fireEvent.change(fileInput, {
        target: {
          files: [new File(["bill.png"], "bill.png", { type: "image/png" })],
        },
      });
      expect(handleChangeFile).toHaveBeenCalled();
      expect(fileInput.files[0].name).toBe("bill.png");
    });
  });

  describe("When i add a non-image file as bill proof", () => {
    test("Then throw an alert", () => {
      Object.defineProperty(window, "localeStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBills = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn((e) => newBills.handleChangeFile);
      const fileInput = screen.getByTestId("file");

      fileInput.addEventListener("change", handleChangeFile);
      fireEvent.change(fileInput, {
        target: {
          files: [new File(["video.mp4"], "video.mp4", { type: "video/mp4" })],
        },
      });

      expect(handleChangeFile).toHaveBeenCalled();
    });
  });
  describe("When I submit form", () => {
    test("Then, I should be sent on Bills page", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBills = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleSubmit = jest.fn((e) => newBills.handleSubmit);
      const newBillForm = screen.getByTestId("form-new-bill");
      newBillForm.addEventListener("submit", handleSubmit);

      fireEvent.submit(newBillForm);

      expect(handleSubmit).toHaveBeenCalled();
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  });
});

// test d'intérgation POST
describe("Given I am a user connected as employee", () => {
  describe("When I send a new Bill", () => {
    test("fetches bills from mock API POST", async () => {
      const getSpy = jest.spyOn(mockStore, "bills");

      const newBill = {
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl:
          "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20,
      };
      const bills = mockStore.bills(newBill);
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect((await bills.list()).length).toBe(4);
    });

    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => Promise.reject(new Error("Erreur 404")));
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => Promise.reject(new Error("Erreur 404")));
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
  })
})

//     test('Then the format must appear', () => {
//       const html = NewBillUI()
//       document.body.innerHTML = html

//       expect(screen.getByTestId("expense-name")).toBeTruthy()
//       expect(screen.getByTestId("datepicker")).toBeTruthy()
//       expect(screen.getByTestId("amount")).toBeTruthy()
//       expect(screen.getByTestId("vat")).toBeTruthy()
//       expect(screen.getByTestId("pct")).toBeTruthy()
//       expect(screen.getByTestId("commentary")).toBeTruthy()
//       expect(screen.getByTestId("file")).toBeTruthy()
//       expect(screen.getByTestId("button")).toBeTruthy()
//     })
//     describe("When I submit the form ", () => {
//       test("Then I upload a file in right format ", () => {
//         const html = NewBillUI()
//         document.body.innerHTML = html

//         mockStore.bills = jest.fn().mockImplementation(() => {
//           return {
//             create: () => {
//               return Promise.resolve({})
//             },
//           };
//         });

//         const onNavigate = (pathname) => {
//           document.body.innerHTML = pathname
//         };

//         const newBill = new NewBill({ 
//           document,
//           onNavigate,
//           store: mockStore, bills,
//           localStorage: window.localStorage,
//         });
//         const handleChangeFile = jest.fn(newBill.handleChangeFile)
//         const inputFile = screen.getByTestId("file")
//         inputFile.addEventListener("change", handleChangeFile)
//         fireEvent.change(inputFile, {
//           target: {
//             files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })],
//           },
//         });
//         jest.spyOn(window, "alert"); 

//         expect(inputFile).toBeTruthy()
//         expect(handleChangeFile).toHaveBeenCalled()
//         expect(window.alert).not.toHaveBeenCalled()
//       });

//       test("Then I upload a file in a format that isn't corresponding to the criteria", () => {
//         const html = NewBillUI()
//         document.body.innerHTML = html

//         mockStore.bills = jest.fn().mockImplementation(() => {
//           return {
//             create: () => {
//               return Promise.resolve({})
//             }
//           }
//         })

//         const onNavigate = (pathname) => {
//           document.body.innerHTML = pathname
//         };

//         const newBill = new NewBill({
//           document,
//           onNavigate,
//           store: mockStore,
//           bills,
//           localStorage: window.localStorage,

//         });

//         const handleChangeFile = jest.fn(newBill.handleChangeFile)
//         const inputFile = screen.getByTestId("file")
//         inputFile.addEventListener("change", handleChangeFile)
//         fireEvent.change(inputFile, {
//           target: {
//             files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })],
//           }
//         })
//         jest.spyOn(window, "alert").mockImplementation(() => {})

//         expect(inputFile).toBeTruthy();
//         expect(handleChangeFile).toHaveBeenCalled();
//         expect(window.alert).toHaveBeenCalled();
//       });
//     });

//     test("Then the new bill is created ", () => {
//       const html = NewBillUI();
//       document.body.innerHTML = html

//       mockStore.bills = jest.fn().mockImplementation(() => {
//         return {
//           create: () => {
//             return Promise.resolve({})
//           },
//         };
//       });

//       const OnNavigate = (pathname) => {
//         document.body.innerHTML = pathname
//       };

//       const newBill = new NewBill({
//         document,
//         onNavigate,
//         store: mockStore,
//         localStorageMock: window.localStorage,
//       });

//       const bill = {
//         email: "a@a",
//         type: "Hôtel et logement",
//         name: "encore",
//         amount: "400",
//         date: "2004-04-04",
//         vat: 80,
//         pct: 20,
//         commentary: "séminaire billed",
//         fileUrl: "test.png",
//         fileName: "preview-facture-free-201801-pdf-1.jpg",
//         status: "pending",
//       }

//       screen.getByTestId("expense-name").value = bill.name
//       screen.getByTestId("datepicker").value = bill.date
//       screen.getByTestId("amount").value = bill.amount
//       screen.getByTestId("vat").value = bill.vat
//       screen.getByTestId("pct").value = bill.pct
//       screen.getByTestId("commentary").value = bill.commentary
//       newBill.fileName = bill.fileName
//       newBill.fileUrl = bill.fileUrl

//       const form = screen.getByTestId("form-new-bill")
//       newBill.updateBill = jest.fn()
//       const submitForm = jest.fn((e) => {
//         newBill.handleSubmit(e)
//       });
      
//       form.addEventListener("submit", submitForm)
//       fireEvent.submit(form)

//       expect(submitForm).toHaveBeenCalled()
//       expect(newBill.updateBill).toHaveBeenCalled()
//     });

//     test("Then the error 500 occurs ", async () => {
//       // Naviguer dans une new bill.
//       Object.defineProperty(window, "localStorage", {
//         value: localStorageMock,
//       });
//       window.localStorage.setItem(
//         "user",
//         JSON.stringify({
//           type: "Employee",
//         })
//       );

//       const root = document.createElement("div")
//       root.setAttribute("id", "root")
//       document.body.append(root)
//       router()
//       window.onNavigate(ROUTES_PATH.NewBill)

//       const newBill = new NewBill({
//         document,
//         onNavigate,
//         store: mockStore,
//         localStorage: window.localStorage,
//       })

//       mockStore.bills = jest.fn().mockImplementation(() => {
//         return {
//           update: () => {
//             return Promise.reject(new Error("Erreur 500"))
//           },
//         }
//       })

//       const form = screen.getByTestId("form-new-bill")
//       newBill.updateBill = jest.fn()
//       const submitForm = jest.fn((e) => {
//         newBill.handleSubmit(e)
//       })
//       form.addEventListener("submit", submitForm)
//       fireEvent.submit(form)

//       jest.spyOn(console, "error").mockImplementation(() => {})
//       await new Promise(process.nextTick)
//       expect(console.error).toBeCalled()
//     })
//   })
// })
