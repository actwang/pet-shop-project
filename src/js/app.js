var pet_num = 0
var custumer_num = 0
var custumer_list = []
App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);
        petTemplate.find('.adoption-status').text(data[i].adopted);

        // Check if vaccination history exists
        if (data[i].vaccinationHistory) {
          var vaccinationLink = data[i].vaccinationHistory;
          var vaccinationStatusHTML = '<a href="#" class="vaccination-link" data-vaccination="' + vaccinationLink +  '">View Vaccination History</a>';
          petTemplate.find('.vaccination-status').html(vaccinationStatusHTML);
        }

        petsRow.append(petTemplate.html());
      }
      // Register click event for vaccination link
      $('.vaccination-link').on('click', function(event) {
        event.preventDefault();
        var vaccinationLink = $(this).data('vaccination');
        
        // Render vaccination history
        App.renderVaccinationHistory(vaccinationLink);
      });
    });

    return await App.initWeb3();
  },

  renderVaccinationHistory: function(vaccinationLink) {
      // Render the vaccination history
      console.log(vaccinationLink)
      let text = vaccinationLink;
      const vaccine = text.split(",");
      var vaccinationHistoryHTML = '<h3>Vaccination History for Pet </h3>';
      vaccinationHistoryHTML += '<ul>';
      for (var i = 0; i < vaccine.length; i++) {
        //var vaccine = vaccinationLink[i].vaccine;
        //var date = vaccinationLink[i].date;
        
        vaccinationHistoryHTML += '<li>' + vaccine[i] + '</li>';
        //vaccinationHistoryHTML += '<li>' + vaccine + ' - ' + date + '</li>';
      }
      vaccinationHistoryHTML += '</ul>';
  
      $('#vaccinationHistoryModalBody').html(vaccinationHistoryHTML);
  
      
      $('#vaccinationHistoryModal').modal('show');
    
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
    
      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });
    

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.btn-reset', App.resetAdoption);
  },

  markAdopted: function() {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
    
      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      pet_num = 0
      custumer_num = 0
      custumer_list = []
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          // for any pets who's already adopted by an adopter, we disable the Adopt button and
          //    set its "adopted" status to Yes.
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
          $('.panel-pet').eq(i).find('.adoption-status').text('Yes');
          pet_num = pet_num + 1
          if (custumer_list.includes(adopters[i]) == false){
            custumer_num = custumer_num + 1
            custumer_list.push(adopters[i])
          }
        }
      }
      document.getElementById('pet_num').innerHTML = pet_num
      document.getElementById('custumer_num').innerHTML = custumer_num
    }).catch(function(err) {
      console.log(err.message);
    });
    
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
      var account = accounts[0];
    
      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
    
        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

    // Function to call the resetAdoptionStatus function
  resetAdoption: async function(e) {
    e.preventDefault();
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
      var account = accounts[0];
      var adoptionInstance;
    
      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
    
        // Execute adopt as a transaction by sending account
        return adoptionInstance.resetAdoptionStatus({from: account});
      }).then(function() {
        console.log('reset success');
        pet_num = 0;
        custumer_list = [];
        custumer_num = 0;
            
        document.getElementById('pet_num').innerHTML = pet_num;
        document.getElementById('custumer_num').innerHTML = custumer_num;
        return ;
      }).catch(function(err) {
        console.log(err.message);
      });
    });

  }

};


$(function() {
  $(window).load(function() {
    document.getElementById('pet_num').innerHTML = pet_num
    document.getElementById('custumer_num').innerHTML = custumer_num
    App.init();
  });
});

function filterChanged(){
  const filterDropdown = document.getElementById('filterDropdown');
  const selectedValue = filterDropdown.value;
  const pets = document.querySelectorAll('#petsRow .div-pet');
  console.log(pets[0].querySelector('.panel-title'));

  for (let i = 0; i < pets.length; i++){
    // get current pet's adoption status
    let pet = pets[i];
    let adoptionStatus = pet.querySelector('.adoption-status');

    // if clients wants to see ones available and this pet's Adopted == Yes, hide it
    if (selectedValue==='available' && adoptionStatus.textContent ==='Yes'){
      pet.style.display = 'none';
    } else if (selectedValue ==='adopted' && adoptionStatus.textContent === 'No'){
      pet.style.display = 'none';
    } else{
      pet.style.display = 'flex';
    }
  };
};