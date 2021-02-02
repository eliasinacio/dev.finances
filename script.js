// Abrir e fechar o modal
const Modal = {
  open() {
    document.querySelector('.modal-overlay')
      .classList
      .add('active')
  },
  close() {
    document.querySelector('.modal-overlay')
      .classList
      .remove('active')
  }
}


// Armazenamento no Navegador
const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },

  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  }
}


// Cálculo de Entradas e saídas
const Transaction = {
  // array com as transações.
  all: Storage.get(),
  
  add(transaction) {
    Transaction.all.push(transaction)

    App.reload()
  },

  remove(index) {
    Transaction.all.splice(index, 1)
    
    App.reload()
  },

  incomes() {
    // somar as entradas
    let income = 0;
    Transaction.all.forEach(transaction => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    })

    return income;
  },

  expenses() {
    // somar as saídas
    let expense = 0;

    Transaction.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expense += transaction.amount
      }
    })

    return expense
  },
  
  total() {
    // resultado
    return Transaction.incomes() + Transaction.expenses()
  }
}


// FUNCIONALIDADE RELACIONADAS À PARTE GRÁFICA, A DOM.
const DOM = {
  // "pega" o container da table para adicionar os filhos com as funções
  transactionsContainer: document.querySelector('#data-table tbody'),

  // cria um tr e preenche com o html do transaction
  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction)
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)
  },

  // o corpo da alteração que vai ser adicionada à table
  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense"
    // operador ternário, se (amount > 0) a variável recebe income, senão recebe expense

    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
      </td>
    `

    return html // retorna algo da própria função
  },

  // atualiza os valores mostrados no Balance
  updateBalance () {
    document
      .getElementById('incomeDisplay')
      .innerHTML = 
      expense = Utils.formatCurrency(Transaction.incomes())
    document
      .getElementById('expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses())
    document
      .getElementById('totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total())

  },

  clearTransactions () {
    DOM.transactionsContainer.innerHTML = ""
  }
}


// Formatação da moeda para BRL
const Utils = {
  formatAmount(value) {
    value = Number(value) * 100
    
    return value
  },

  formatDate(date) {
    const splitedDate = date.split("-") // "quebra" no parâmetro e cria um array com as partes  

    return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : ""

    value = String(value).replace(/\D/, "")

    value = Number(value) / 100

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })

    return signal + value
  }
}


// FÓRMULÁRIO - Entrada de dados 
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

  // verificar se todas as informações foram preenchidas
  validateFields() {
    // desestruturação
    const {description, amount, date } = Form.getValues()
    if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
        throw new Error("Por favor, preencha todos os campos")
        // "joga pra fora/retorna" o objeto de erro com a mensaagem
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description: description,
      amount: amount,
      date: date
    }
  },

  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },

  submit(event) {
    event.preventDefault()

    try {
      // validar as informações preenchidas
      Form.validateFields()

      // formatação dos dados
      const transaction = Form.formatValues()

      // salvar transação
      Transaction.add(transaction)

      // apagar os dados do formulário
      Form.clearFields()

      // fechar modal
      Modal.close()
    } catch (error) {
      alert(error.message)
    }

  }
}


const App = {
  init() {
    // para cada objeto do array transactions vai ser usado como parâmetro
    // na função de adicionar à table
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index)
    })

    DOM.updateBalance()

    Storage.set(Transaction.all)
  },

  reload() {
    DOM.clearTransactions()
    App.init()
  }
}
Storage.get()
App.init()