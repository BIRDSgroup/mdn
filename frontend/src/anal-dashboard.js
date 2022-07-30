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
      integration: "", 
      species_2: "", 
      gene_mtx_2: "",  
      run_status: "", 
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
    this.setState({ [evt.target.name]: evt.target.value });
  }
  sendRequest() {
    console.log(this.state); 
    var bodyFormData = new FormData();
    bodyFormData.append('species_1', this.state.species_1); 
    bodyFormData.append('gene_mtx_1', this.state.gene_mtx_1); 
    var payload = {
      anal_id: this.state.anal_id, 
      species_1: this.state.species_1, 
      gene_mtx_1: this.state.gene_mtx_1, 
      integration: this.state.integration, 
      species_2: this.state.species_2, 
      gene_mtx_2: this.state.gene_mtx_2,  
      run_status: this.state.run_status, 
    }
    axios({
      url: '/api/runanal', 
      method: 'post', 
      headers: {
        'Content-Type': "multipart/form-data",
      },
      data: bodyFormData,
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
          <Row className='w-responsive mx-auto p-3 mt-2'>
            <Col><h2>Analysis Portal</h2></Col>
            <Col className='mt-2'><Link to={'/analysis/runs'}>Previous runs</Link></Col>
          </Row>  
        </Container>
        <Form className="w-responsive mx-auto p-3 mt-2">
        
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Control type="text" name="species_1" value={this.state.species_1} onChange={this.handleChange} placeholder="Name of the species" />
            <Form.Label>Upload Gene count matrix</Form.Label>
            <Form.Control type="file" name="gene_mtx_1" value={this.state.gene_mtx_1} onChange={this.handleChange} />
            OR
            <Form.Control type="text" placeholder="Enter Run ID to automatically import data from previous Alignment pipeline runs." />
          </Form.Group>
          

          <Form.Group className="mb-3" controlId="formBasicCheckbox1">
            <Form.Check type="checkbox" name="integration" checked={this.state.integration} onChange={this.handleIntegration} label="Integrated study of multiple species." />

            {this.state.integration ? (
              <>
                <Form.Control type="text" name="species_2" value={this.state.species_2} onChange={this.handleChange} placeholder="Name of the second species" />
                <Form.Label>Upload Gene count matrix</Form.Label>
                <Form.Control type="file" name="gene_mtx_2" value={this.state.gene_mtx_2} onChange={this.handleChange}/>
                OR
                <Form.Control type="text" placeholder="Enter Run ID to automatically import data from previous Alignment pipeline runs." />
              </>
            )
            : (<></>)

            }
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicCheckbox2">
            <Form.Check type="checkbox" name = "use_custom_id" checked={this.state.use_custom_id} onChange={this.handleCustom} label="Use custom Analysis ID to refer the results of this analysis" />
            {this.state.use_custom_id ? (
              <>
                <Form.Control type="text" name="custom_id" value={this.state.custom_id} onChange={this.handleChange} placeholder="Custom analysis ID" />
              </>
            ): (<></>)

            }
          </Form.Group>

          <Button variant="primary" type="submit" onClick={this.handleSubmit}>
            Run the Analysis!
          </Button>
        </Form>

        <AlertDismissible handler={this.alertHandler} show={this.state.showalert} variant={this.state.variant} message={this.state.alertmsg} />

      </div>      
    );
  }
    
}

export default AnalysisDashboard;
