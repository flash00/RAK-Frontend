import React from 'react';
import axios from 'axios';
import Item from './Item';
import ProjectEdit from './ProjectEdit';

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
    this.submitEdits = this.submitEdits.bind(this)
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

  submitEdits(editedProjectData) {
    this.setState({currentlyEditing: false})
    axios.put(`http://localhost:8181/projects/${this.props.match.params.project_id}`, { project: editedProjectData })
    .then((response) => {
      const newProjectInfo = response.data.project
      this.setState({newProjectInfo})
    })
    .catch((error) => {console.log('Error in updating the project.', error)})
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
              submitEdits={this.submitEdits}
            />
          :
            <div>
              <button className="edit-button" onClick={this.startEditing}>
                Edit
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
              Add
            </button>

            <select className="donation-type-drop-down" onChange={this.updateDonationTypeInput}>
              <option value="">Select Donation Type</option>
              {this.state.donationTypes.map((option) => {
                return (
                  <option value={option}>{option}</option>
                )
              })}
            </select>

            <input onChange={this.updateItemNameInput} type="text" placeholder="Item needed" value={this.state.itemNameInput} />
            <input onChange={this.updateQuantityRequested} type="number" placeholder="Quantity needed" value={this.state.newDonation.quantity_requested} />
            <input onChange={this.updateQuantityReceived}type="number" placeholder="Quantity received" value={this.state.newDonation.quantity_received} />
          </form>
        </div>

        <div className="donations-list-container">
          {this.state.donations.map((item) =>
            <div className="item-row">
              <button className="remove-item-button" id={item.id} onClick={this.removeItemButton} >
                Remove
              </button>

              <span>
                Item: {item.item} |
                Quantity Requested: {item.quantity_requested} |
                Quantity Received: {item.quantity_received}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default ProjectOrganizationShow;