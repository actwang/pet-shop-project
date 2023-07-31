var pet_num = 0
var custumer_num = 0
var custumer_list = []
App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      App.petsData = data;
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
          var vaccinationStatusHTML = '<a href="#" class="vaccination-link" data-vaccination="' + vaccinationLink + '" data-id="' + i + '">View Vaccination History</a>';
          petTemplate.find('.vaccination-status').html(vaccinationStatusHTML);
        }

        petsRow.append(petTemplate.html());
      }
      // Register click event for vaccination link
      $('.vaccination-link').on('click', function(event) {
        event.preventDefault();
        var vaccinationLink = $(this).data('vaccination');
        var petid = $(this).data('id');
        
        // Render vaccination history
        App.renderVaccinationHistory(vaccinationLink, petid);
      });
    });

    return await App.initWeb3();
  },

  renderVaccinationHistory: function(vaccinationLink, petId) {
      // Render the vaccination history
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        var adoptionInstance;
        App.contracts.Adoption.deployed().then(function(instance){
          adoptionInstance = instance;

          return adoptionInstance.getVaccinationRecord(petId, {from: account});
        }).then(function(result){
          var vaccineName = result[0];
          var date = result[1];
          // now we get the vax data, render it 
          var vaccinationHistoryHTML = '<h3>Vaccination History for Pet </h3>';
          vaccinationHistoryHTML += '<ul>';
          vaccinationHistoryHTML += '<il>';
          vaccinationHistoryHTML += vaccineName;
          vaccinationHistoryHTML += '</il>';
          vaccinationHistoryHTML += '<il>';
          vaccinationHistoryHTML += date;
          vaccinationHistoryHTML += '</il>';
          vaccinationHistoryHTML += '</ul>';
          
          $('#vaccinationHistoryModalBody').html(vaccinationHistoryHTML);
      
          $('#vaccinationHistoryModal').modal('show');
        })
      });
    
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
          App.petsData[i].adopted = 'Yes'
          pet_num = pet_num + 1
          if (custumer_list.includes(adopters[i]) == false){
            custumer_num = custumer_num + 1
            custumer_list.push(adopters[i])
          }
        }
      }
      document.getElementById('pet_num').innerHTML = pet_num;
      document.getElementById('custumer_num').innerHTML = custumer_num;
      //App.setAdoptedPetsNum(pet_num);
      //App.setCustomerNum(custumer_num);
      web3.eth.defaultAccount = web3.eth.accounts[0];
      var most_adopted_breed = App.trackMostAdoptedBreed();
      document.getElementById('most_adopted_breed').innerHTML = most_adopted_breed;
      return adoptionInstance.setMostAdoptedBreed(most_adopted_breed, { from: web3.eth.defaultAccount });
    
    }).then(function(){
      console.log("Most adopted breed updated successfully!");
    }).then(function(){
      web3.eth.defaultAccount = web3.eth.accounts[0];
      return adoptionInstance.setCustomerNum(custumer_num, {from: web3.eth.defaultAccount});
    }).then(function(){
      console.log("customer number set successfully!");
    }).then(function(){
      web3.eth.defaultAccount = web3.eth.accounts[0];
      return adoptionInstance.setAdoptedPetsNum(pet_num, {from: web3.eth.defaultAccount});
    }).then(function(){
      console.log("Adopted pets number successfully!");
    })
    .catch(function(err) {
      console.log(err.message);
    });
  },

  // Function to track the most adopted breed
  trackMostAdoptedBreed:  function() {
    var breedsCount = {}; // Object to store the count of each breed
    var mostAdoptedBreed = ""; // Variable to store the most adopted breed
    var maxCount = 0; // Variable to store the maximum count

    // Loop through the pets data to count the occurrences of each breed
    for (var i = 0; i < App.petsData.length; i++) {
      if (App.petsData[i].adopted != 'Yes'){
        continue
      }
      var breed = App.petsData[i].breed;
      
      if (breed in breedsCount){
        breedsCount[breed] = breedsCount[breed] + 1;
      }
      else {
        breedsCount[breed] = 1
      }

      if (breedsCount[breed] > maxCount) {
        maxCount = breedsCount[breed];
        mostAdoptedBreed = breed;
      }
      else if (breedsCount[breed] == maxCount) {
        mostAdoptedBreed =  mostAdoptedBreed + ', ' + breed
      }
    }
    console.log(mostAdoptedBreed);

    return mostAdoptedBreed;
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
        //App.setAdoptedPetsNum(pet_num);
        //App.setCustomerNum(custumer_num);

        document.getElementById('most_adopted_breed').innerHTML = "";
        // reset buttons to clickable
        for (i = 0; i < 16; i++) {
            $('.panel-pet').eq(i).find('button').text('Adopt').attr('disabled', false);
            $('.panel-pet').eq(i).find('.adoption-status').text('No');
            App.petsData[i].adopted = 'No';
        };
        web3.eth.defaultAccount = web3.eth.accounts[0];
        var most_adopted_breed = "";
        return adoptionInstance.setMostAdoptedBreed(most_adopted_breed, { from: web3.eth.defaultAccount });
      })
      .then(function(){
        console.log("Most adopted breed updated successfully!");
      }).then(function(){
        web3.eth.defaultAccount = web3.eth.accounts[0];
        return adoptionInstance.setCustomerNum(custumer_num, {from: web3.eth.defaultAccount});
      }).then(function(){
        console.log("customer number set successfully!");
      }).then(function(){
        web3.eth.defaultAccount = web3.eth.accounts[0];
        return adoptionInstance.setAdoptedPetsNum(pet_num, {from: web3.eth.defaultAccount});
      }).then(function(){
        console.log("Adopted pets number successfully!");
      })
      .catch(function(err) {
        console.log(err.message);
      });
    });

  },
  setCustomerNum: function (customer_num) {
    var adoptionInstance;
    web3.eth.defaultAccount = web3.eth.accounts[0]
    App.contracts.Adoption.deployed()
      .then(function (instance) {
        adoptionInstance = instance;

        return adoptionInstance.setCustomerNum(customer_num, { from: web3.eth.defaultAccount });
      })
      .catch(function (error) {
        console.error("Error setting customer number:", error);
      });
  },
  setAdoptedPetsNum: function () {
    var adoptionInstance;
    web3.eth.defaultAccount = web3.eth.accounts[0]
    App.contracts.Adoption.deployed()
      .then(function (instance) {
        adoptionInstance = instance;

        return adoptionInstance.setAdoptedPetsNum(pet_num, { from: web3.eth.defaultAccount });
      })
      .catch(function (error) {
        console.error("Error setting adopted pets number:", error);
      });
  },
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