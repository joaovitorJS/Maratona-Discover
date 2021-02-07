const Modal = {
  open() {
    //abrir modal
    //adicionar a class active ao modal
    document
      .querySelector('.modal-overlay')
      .classList
      .add('active');
  },
  close() {
    //fechar o modal
    //remover a class active do modal
    document
      .querySelector('.modal-overlay')
      .classList
      .remove('active');
  }
  //desafio trocar as duas por um só - a toogle()
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },
  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  }
}

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    this.all.push(transaction);
   
    App.reload();
  },

  remove(index) {
    this.all.splice(index, 1);
    App.reload();
  },

  edit(index) {
    //abre o Modal
    Modal.open();
    //coloca as informações anteriores
    const description = document.querySelector('input#description');
    const amount = document.querySelector('input#amount');
    const date = document.querySelector('input#date');
    const transaction = this.all[index];

    description.value = transaction.description;
    amount.value = transaction.amount/100;
    date.value = Utils.formatDateModal(transaction.date);
    var rem = true;
    document.querySelector(".input-group.actions button").addEventListener("click", function(){      
      if (rem) {
        Transaction.remove(index);
        rem = false;
      }
    });    
  },

  incomes() {
    let income = 0;
    this.all
      .forEach(transaction => {
        income += transaction.amount > 0 ? transaction.amount : 0;
      })

    return income;
  },

  expenses() {
    // somar as saídas
    let expense = 0;
    this.all
      .forEach(transaction => {
        expense += transaction.amount < 0 ? transaction.amount : 0;
      })

    return expense;
  },

  total() {
    //entradas - saídas
    return this.incomes() + this.expenses();
  }
};

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),
  
  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);

    const html = 
    `
      <td class="description">${transaction.description}</td>
      <td class=${CSSclass}>${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onclick="Transaction.remove(${index})"src="./assets/minus.svg" alt="Remover transação">
      </td>
      <td class="edit">
        <img onclick="Transaction.edit(${index})" src="./assets/edit.svg" alt="Editar transação">
      </td>
    `;
    return html;
  },

  updateBalance() {
    document
      .getElementById("incomeDisplay")
      .innerHTML = Utils.formatCurrency(Transaction.incomes());
    document
      .getElementById("expenseDisplay")
      .innerHTML = Utils.formatCurrency(Transaction.expenses());
    document
      .getElementById("totalDisplay")
      .innerHTML = Utils.formatCurrency(Transaction.total());
    DOM.updateColorTotal();
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },

  updateColorTotal() {
    
    if (Transaction.total() < 0) {
      
      document
        .querySelector(".card.total")
        .classList
        .add("negative");
    } else {
      document
        .querySelector(".card.total")
        .classList
        .remove("negative");
    }
  }
}

const Utils = {
  formatAmount(value) {
    value = Number(value.replace(/\,/g, ".")) * 100;
    return value;
  },

  formatDate(date) {
    const splittedDate = date.split("-");
    return `${splittedDate[2]}
            /${splittedDate[1]}
            /${splittedDate[0]}`;
  },

  formatDateModal(date) {
    const dateReplace = String(date).replace(/\D/g, "");
    const day = dateReplace[0] + dateReplace[1];
    const month = dateReplace[2] + dateReplace[3];
    const year = dateReplace[4] + dateReplace[5] + dateReplace[6] + dateReplace[7];
    return `${year}-${month}-${day}`;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";
    value = String(value).replace(/\D/g, ""); //tira tudo o que não é número -> /\D/g : regex

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })

    return signal+value;
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),
  
  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues();
    console.log(description, amount, date);
    if ( description.trim() === "" ||
         amount.trim() === "" ||
         date.trim() === "" ) {
      throw new Error("Por favor, preencha todos os campos")      
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date
    };
  },
  
  saveTransaction(transaction) {
    Transaction.add(transaction);
  },

  clearFields() {
    Form.description.value = "",
    Form.amount.value = "",
    Form.date.value = ""
  },

  submit(event) {

    event.preventDefault();

    try {
      Form.validateFields();
      const transaction = Form.formatValues();
      Form.saveTransaction(transaction);
      Form.clearFields();
      Modal.close();
    } catch(error) {
      alert(error.message);
    }
  },

}

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index);
    });
    
    DOM.updateBalance();
    Storage.set(Transaction.all);
  },

  reload() {
    DOM.clearTransactions();

    App.init();
  },
}

App.init();

