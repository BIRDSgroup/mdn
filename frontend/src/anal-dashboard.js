import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import React from 'react';
import axios from "axios";
import AlertDismissible from './components/alert';
import md5 from 'md5'; 
import {Container, Row, Col} from 'react-bootstrap/esm'; 
import { Link } from 'react-router-dom';
import Moment from 'moment'; 

class AnalysisDashboard extends React.Component {
  constructor() {
    super(); 

    this.state = {
      anal_id: "", 
      species_1: "", 
      gene_mtx_1: "", 
      species_2: "", 
      gene_mtx_2: "",  
      run_status: "Queued", 
      integration: false, 
      use_custom_id: false,
      custom_id: "", 

      showalert: false, 
      alertmsg: "random message", 
      variant: "success", 
    }; 
    this.handleIntegration = this.handleIntegration.bind(this); 
    this.handleCustom = this.handleCustom.bind(this); 
    this.handleChange = this.handleChange.bind(this); 
    this.handleFileChange = this.handleFileChange.bind(this); 
    this.handleSubmit = this.handleSubmit.bind(this); 
    this.sendRequest = this.sendRequest.bind(this); 
    this.alertHandler = this.alertHandler.bind(this); 
  }
  handleIntegration() {
    this.setState({ integration: !this.state.integration });
  }
  handleCustom() {
    this.setState({use_custom_id: !this.state.use_custom_id}); 
  }
  handleChange (evt) {
    console.log("Inside handlechange"); 
    console.log(evt); 
    this.setState({ [evt.target.name]: evt.target.value });
  }
  handleFileChange(evt) {
    console.log("Inside handlefilechange"); 
    console.log(evt.target.files); 
    this.setState({[evt.target.name]: evt.target.files[0]}); 
  }
  sendRequest() {
    console.log(this.state); 
    let formData = new FormData();
    var payload = {
      anal_id: this.state.anal_id, 
      species_1: this.state.species_1, 
      gene_mtx_1: this.state.gene_mtx_1, 
      integration: this.state.integration, 
      species_2: this.state.species_2, 
      gene_mtx_2: this.state.gene_mtx_2,  
      run_status: this.state.run_status, 
    }
    formData.append('anal_id', this.state.anal_id); 
    formData.append('species_1', this.state.species_1); 
    formData.append('gene_mtx_1', this.state.gene_mtx_1, this.state.gene_mtx_1.name); 
    formData.append('integration', JSON.stringify(this.state.integration)); 
    formData.append('species_2', this.state.species_2); 
    if (this.state.integration) {
      // Add more file objects if the integration flag is true. 
      formData.append('gene_mtx_2', this.state.gene_mtx_2, this.state.gene_mtx_2.name); 
    } else {
      // In this case, it'll be a random string and we don't have to worry about it. 
      formData.append('gene_mtx_2', this.state.gene_mtx_2); 
    }
    formData.append('run_status', this.state.run_status); 
    
    axios({
      url: '/api/runanal', 
      method: 'post', 
      headers: {'content-type': 'multipart/form-data'},
      data: formData,
    }).then((response) => {
      console.log(response); 
      this.setState({showalert:true, variant:"success", alertmsg: response.data['status']}); 
    }).catch((error) => {
      if (error.response) {
        // console.log(error.response.data);
        console.log(error.response.statusText);
        // console.log(error.response.headers);
        this.setState({showalert:true, variant:"danger", alertmsg: error.response.statusText}); 
      }
    });  
  }
  
  handleSubmit() {
    // Clear the alert message beforehand to avoid confusion
    this.setState({showalert:true, alertmsg: ""}); 
    
    // console.log("Button pressed!"); 
    var datetime_str = Moment().format(); 
    var hash_val = String(md5(this.state.species_1 + this.state.species_2 + datetime_str)); 

    // console.log(hash_val); 
    // Set run id as the hash of current timestamp if prev_run_id is not provided. 
    if (this.state.use_custom_id) {
      console.log("Custom analysis ID"); 
      this.setState({anal_id: this.state.custom_id}, this.sendRequest); 
    } else {
      console.log("Calculating new analysis id."); 
      this.setState({anal_id: hash_val}, this.sendRequest); 
    }
  }

  alertHandler() {
    this.setState({showalert: false}); 
  }



  render () {
    return (
      <div>
        <Container>
          
          <Row className='w-responsive mx-auto p-3 mt-2 text-center'>
            <Col><h2>Analysis Portal</h2></Col>
            <Col className='mt-2'><Link to={'/analysis/runs'}><Button variant='outline-secondary'>Previous runs</Button></Link></Col>
          </Row>  
       
        <Form className="w-responsive mx-auto p-3 mt-2"  formMethod="POST" formEncType="multipart/form-data">
        
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label className='mt-3'>Name of the species</Form.Label>
            <Form.Control type="text" name="species_1" value={this.state.species_1} onChange={this.handleChange} placeholder="mouse" />
            <Form.Label className='mt-3'>Upload Gene count matrix (.h5 file format)</Form.Label>
            <Form.Control type="file" name="gene_mtx_1" onChange={this.handleFileChange} />
            <br/> OR <br/>
            <Form.Label className='mt-3'>Enter Run ID to automatically import data from previous Alignment pipeline runs.</Form.Label>
            <Form.Control type="text" placeholder="c9c9873536f6bf648e3852d6e49a6b83" />
          </Form.Group>
          

          <Form.Group className="mb-3" controlId="formBasicCheckbox1">
            <Form.Check type="checkbox" name="integration" checked={this.state.integration} onChange={this.handleIntegration} label="Integrated study of multiple species." />

            {this.state.integration ? (
              <>
                <Form.Label className='mt-3'>Name of the second species (for integrated study) </Form.Label> 
                <Form.Control type="text" name="species_2" value={this.state.species_2} onChange={this.handleChange} placeholder="marmoset" />
                <Form.Label className='mt-3'>Enter Run ID to automatically import data from previous Alignment pipeline runs.</Form.Label>
                <Form.Control type="file" name="gene_mtx_2" onChange={this.handleFileChange}/>
                <br/> OR <br/>
                <Form.Label className='mt-3'>Upload Gene count matrix (.h5 file format)</Form.Label>
                <Form.Control type="text" placeholder="c9c9873536f6bf648e3852d6e49a6b83" />
              </>
            )
            : (<></>)

            }
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicCheckbox2">
            <Form.Check type="checkbox" name = "use_custom_id" checked={this.state.use_custom_id} onChange={this.handleCustom} label="Use custom Analysis ID to refer the results of this analysis" />
            {this.state.use_custom_id ? (
              <>
                <Form.Control type="text" name="custom_id" value={this.state.custom_id} onChange={this.handleChange} placeholder="9cb052a8d84c93f2070e09c2c13251f9" />
              </>
            ): (<></>)

            }
          </Form.Group>

          <Button variant="primary" onClick={this.handleSubmit}>
            Run the Analysis!
          </Button>
        </Form>

        <AlertDismissible handler={this.alertHandler} show={this.state.showalert} variant={this.state.variant} message={this.state.alertmsg} />
        </Container>
      </div>      
    );
  }
    
}

export default AnalysisDashboard;
