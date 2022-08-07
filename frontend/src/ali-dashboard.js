import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import AlertDismissible from './components/alert';
import React from 'react';
import axios from "axios";
import md5 from 'md5'; 
import Moment from 'moment'; 
// import Container from 'react-bootstrap/esm/Container';
// import Col from 'react-bootstrap/esm/Col';
// import Row from 'react-bootstrap/esm/Row';
import {Container, Row, Col} from 'react-bootstrap/esm'; 
import { Link } from 'react-router-dom';

class AlignDashboard extends React.Component {
  constructor() {
    super(); 

    this.state = {
      run_id: "", 
      species: "", 
      raw_reads: "", 
      build_transcriptome: false, 
      fasta_file: "", 
      gtf_file: "", 
      resume_prev: false, 
      prev_run_id: "", 
      run_status: "", 
      comments: "", 

      showalert: false, 
      alertmsg: "random message", 
      variant: "success", 
    }; 
    this.handleTrans = this.handleTrans.bind(this); 
    this.handlePrev = this.handlePrev.bind(this); 
    this.handleSubmit = this.handleSubmit.bind(this); 
    this.handleChange = this.handleChange.bind(this); 
    this.sendRequest = this.sendRequest.bind(this); 
    this.alertHandler = this.alertHandler.bind(this); 

  }
  handleTrans() {
    this.setState({ build_transcriptome: !this.state.build_transcriptome });
  }
  handlePrev() {
    this.setState({resume_prev: !this.state.resume_prev}); 
  }

  sendRequest() {
    var payload = {
      run_id: this.state.run_id, 
      species: this.state.species, 
      raw_reads: this.state.raw_reads, 
      build_transcriptome: this.state.build_transcriptome, 
      fasta_file: this.state.fasta_file, 
      gtf_file: this.state.gtf_file, 
      run_status: this.state.run_status, 
      comments: this.state.comments, 
    }
    axios({
      url: '/api/runalign', 
      method: 'post', 
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(payload),
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
    var hash_val = String(md5(this.state.species + datetime_str)); 

    // console.log(hash_val); 
    // Set run id as the hash of current timestamp if prev_run_id is not provided. 
    if (this.state.resume_prev) {
      console.log("Resuming prev run"); 
      this.setState({run_id: this.state.prev_run_id}, this.sendRequest); 
    } else {
      console.log("Calculating new run id."); 
      this.setState({run_id: hash_val}, this.sendRequest); 
    }
  }

  handleChange (evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  }
  alertHandler() {
    this.setState({showalert: false}); 
  }

  render () {
    Moment.locale('en'); 
    return (
      <div>
        <Container>
          <Row className='w-responsive mx-auto p-3 mt-2'>
            <Col><h2>Alignment Portal</h2></Col>
            <Col className='mt-2'><Link to={'/alignment/runs'}>Previous runs</Link></Col>
          </Row>  
        </Container>
        
        
        
        <Form className="w-responsive mx-auto p-3 mt-2">
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Common Name of the species</Form.Label>
            <Form.Control name="species" type="text" value={this.state.species} onChange={this.handleChange} placeholder="marmoset" />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Location of raw reads</Form.Label>
            <Form.Control name="raw_reads" value={this.state.raw_reads} onChange={this.handleChange} type="text" placeholder="raw_reads/marmoset/" />
            <Form.Text className="text-muted">
              Please make sure that this is a location on the server and not on your local machine.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicCheckbox1">
            <Form.Check type="checkbox" name="build_transcriptome" checked={this.state.build_transcriptome} onChange={this.handleTrans} label="Build transcriptome" />

            {this.state.build_transcriptome ? (
              <>
              <Form.Label>Location of genome reads (.fa file)</Form.Label>
              <Form.Control type="text" name="fasta_file" value={this.state.fasta_file} onChange={this.handleChange} placeholder="Callithrix_jacchus.mCalJac1.pat.X.dna.primary_assembly.fa" />
              <Form.Label>Location of gene annotations (.gtf file)</Form.Label>
              <Form.Control type="text" name="gtf_file" value={this.state.gtf_file} onChange={this.handleChange} placeholder="Callithrix_jacchus.mCalJac1.pat.X.105.filtered.gtf" />
              </>
            ) : (<></>)
            }
            
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicResume">
            <Form.Check type="checkbox" name="resume_prev" checked={this.state.resume_prev} onChange={this.handlePrev} label="Resume Previous run" />

            {this.state.resume_prev ? (
            <>
              <Form.Label>Previous run id</Form.Label>
              <Form.Control type="text" name="prev_run_id" value={this.state.prev_run_id} onChange={this.handleChange} placeholder="46dc4f041432bb51b61c438b0e12bac5" />
            </>
            ) : (<></>)
            }
            
          </Form.Group>

          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>Additional Comments</Form.Label>
            <Form.Control as="textarea" rows={3} name="comments" value={this.state.comments} onChange={this.handleChange} 
              placeholder="Use this area for comments or additional fields. Please note that additional 
              fields should be key:value pairs separated by commas (,)."
            />
          </Form.Group>

          <Button variant="primary" type="button" onClick={this.handleSubmit}>
            Run the Pipeline!
          </Button>
        </Form>

        <AlertDismissible handler={this.alertHandler} show={this.state.showalert} variant={this.state.variant} message={this.state.alertmsg} />

      </div>
        
    );
  }
    
}

export default AlignDashboard;
