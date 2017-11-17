import React from 'react';
import axios from 'axios';
import Item from './Item';
import ProjectEdit from './ProjectEdit';

import * as FontAwesome from 'react-icons/lib/fa';

class ProjectOrganizationShow extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      organizationInfo: {},
      newProjectInfo: {
        project_name: '',
        street_address: '',
        city: '',
        state: '',
        zip_code: '',
        description: ''
      },
      donations: [],
      donationTypes: [],
      newDonation: {
        quantity_requested: '',
        quantity_received: '',
        project_id: this.props.match.params.project_id
      },
      itemNameInput: '',
      donationTypeInput: '',
      currentlyEditing: false
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.projectsCall = this.projectsCall.bind(this)
    this.organizationsCall = this.organizationsCall.bind(this)
    this.donationTypesCall = this.donationTypesCall.bind(this)
    this.updateQuantityRequested = this.updateQuantityRequested.bind(this)
    this.updateQuantityReceived = this.updateQuantityReceived.bind(this)
    this.updateItemNameInput = this.updateItemNameInput.bind(this)
    this.updateDonationTypeInput = this.updateDonationTypeInput.bind(this)
    this.removeItemButton = this.removeItemButton.bind(this)
    this.startEditing = this.startEditing.bind(this)
    this.submitProjectEdits = this.submitProjectEdits.bind(this)
    this.submitItemQuantityReceivedEdits = this.submitItemQuantityReceivedEdits.bind(this)
    this.updateItemQuantityReceivedField = this.updateItemQuantityReceivedField.bind(this)
  }

  projectsCall() {
    axios.get(`http://localhost:8181/projects/${this.props.match.params.project_id}`)
    .then((response) => {
      const newProjectInfo = response.data.project
      const donations = response.data.donations
      this.setState({newProjectInfo, donations})
    })
    .catch((error) => {console.log('Error in retrieving projects.', error)})
  }

  organizationsCall() {
    axios.get(`http://localhost:8181/organizations/${this.props.match.params.organization_id}`)
    .then((response) => {
      const organizationInfo = response.data.organization
      this.setState({organizationInfo})
    })
    .catch((error) => {console.log('Error in retrieving organizations.', error)})
  }

  donationTypesCall() {
    axios.get('http://localhost:8181/filters')
    .then((response) => {
      const donationTypes = response.data.donation_type
      this.setState({donationTypes})
    })
    .catch((error) => {console.log('Error in retrieving donation types.', error)})
  }

  componentDidMount() {
    this.projectsCall();
    this.organizationsCall();
    this.donationTypesCall();
  }

  updateQuantityRequested(event) {
    const newDonation = Object.assign({}, this.state.newDonation, {quantity_requested: event.target.value})
    this.setState({newDonation})
  }

  updateQuantityReceived(event) {
    const newDonation = Object.assign({}, this.state.newDonation, {quantity_received: event.target.value})
    this.setState({newDonation})
  }

  updateItemNameInput(event) {
    this.setState({
      itemNameInput: event.target.value
    })
  }

  updateDonationTypeInput(event) {
    this.setState({
      donationTypeInput: event.target.value
    })
  }

  handleSubmit(event) {
    event.preventDefault()
    axios.post('http://localhost:8181/donations', {donation: this.state.newDonation, item_name: this.state.itemNameInput, donation_type: this.state.donationTypeInput})
    .then(({data}) => {
      let donations = this.state.donations
      donations.push({item: data.item.item_name, quantity_received: data.donation.quantity_received, quantity_requested: data.donation.quantity_requested})
      this.setState({donations, itemNameInput: '', newDonation: Object.assign({}, this.state.newDonation, {quantity_requested: '', quantity_received: ''}) })
    })
    .catch((error) => {console.log('Error in creating a new item.', error)})
  }

  removeItemButton(event) {
    event.preventDefault()
    axios.delete(`http://localhost:8181/donations/${event.target.id}`)
    .then((response) => {
      const donations = response.data
      this.setState({donations})
    })
    .catch((error) => {console.log('Error in removing an item.', error)})
  }

  startEditing() {
    this.setState({currentlyEditing: true})
  }

  submitProjectEdits(editedProjectData) {
    this.setState({currentlyEditing: false})
    axios.put(`http://localhost:8181/projects/${this.props.match.params.project_id}`, { project: editedProjectData })
    .then((response) => {
      const newProjectInfo = response.data.project
      this.setState({newProjectInfo})
    })
    .catch((error) => {console.log('Error in updating the project.', error)})
  }

  submitItemQuantityReceivedEdits(event, editedItemQuantityReceivedData) {
    event.preventDefault()
    console.log("here")
    axios.put(`http://localhost:8181/donations/${event.target.id}`, {donation: editedItemQuantityReceivedData})
    .then((response) => {
      console.log("*****************")
      console.log(response)
    })
    .catch((error) => {console.log('Error in updating the quantity received.', error)})
  }

  updateItemQuantityReceivedField(event) {
    event.preventDefault()
    const updatedId = parseInt(event.target.id, 10)
    const updatedValue = parseInt(event.target.value, 10)
    let donations = this.state.donations
    donations.map((obj) => {
      if(obj.id === updatedId){
        return obj.quantity_received = updatedValue
      } else {
        return obj
      }
    })
    this.setState({donations})
  }

  render() {
    return (
      <div className="project-organization-display-container">
        <div className="organization-info">
          <p>{this.state.organizationInfo.organization_logo}</p>
        </div>

        <div className="project-info">
          {this.state.currentlyEditing ?
            <ProjectEdit
              newProjectInfo={this.state.newProjectInfo}
              project_id={this.props.match.params.project_id}
              submitProjectEdits={this.submitProjectEdits}
            />
          :
            <div>
              <button className="edit-button" onClick={this.startEditing}>
                <FontAwesome.FaEdit />
              </button>
              <span>
                <p>{this.state.newProjectInfo.project_name}</p>
                <p>{this.state.newProjectInfo.street_address}</p>
                <p>{this.state.newProjectInfo.city}</p>
                <p>{this.state.newProjectInfo.state}</p>
                <p>{this.state.newProjectInfo.zip_code}</p>
                <p>{this.state.newProjectInfo.description}</p>
              </span>
            </div>
          }
        </div>

        <div className="add-donation-container">
          <form className="add-donation-form">
            <button className="add-item-button" onClick={this.handleSubmit}>
              <FontAwesome.FaPlus />
            </button>

            <select className="donation-type-drop-down" onChange={this.updateDonationTypeInput}>
              <option value="">Select Donation Type</option>
              {this.state.donationTypes.map((option) => {
                return (
                  <option value={option}>{option}</option>
                )
              })}
            </select>
            <p>
            <input onChange={this.updateItemNameInput} type="text" placeholder="Item needed" value={this.state.itemNameInput} />
            <input onChange={this.updateQuantityRequested} type="number" placeholder="Quantity needed" value={this.state.newDonation.quantity_requested} />
            <input onChange={this.updateQuantityReceived}type="number" placeholder="Quantity received" value={this.state.newDonation.quantity_received} />
            </p>
          </form>
        </div>

        <div className="donations-list-container">
          {this.state.donations.map((item, index) =>
            <div className="item-row" key={index}>
              <button className="remove-item-button" id={item.id} onClick={this.removeItemButton} >
              <FontAwesome.FaTrash />
              </button>

              <span>
                Item: {item.item} |
                Quantity Requested: {item.quantity_requested} |
                Quantity Received:
                <form
                  className="update-quantity-form"
                  id={item.id}
                  onSubmit={(e) => this.submitItemQuantityReceivedEdits(e, this.state.donations[index])}
                >
                  <input id={item.id} onChange={this.updateItemQuantityReceivedField} type="number" value={item.quantity_received} />

                  <button className="update-quantity-button">
                    <FontAwesome.FaEdit />
                  </button>
                </form>
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default ProjectOrganizationShow;