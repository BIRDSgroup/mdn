import {Link} from 'react-router-dom'
import Table from 'react-bootstrap/Table'
import React, { Component } from 'react';
import AlertDismissible from './components/alert';

class AnalysisAllRuns extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: []
    };
  }

  // Function to make an API call to the flask endpoint and fetch data. 
  componentDidMount() {
    fetch("http://localhost:5000/api/analhistory")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            items: result
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  render() {
    const { error, isLoaded, items } = this.state;
    console.log("Loading table. ")
    console.log(items); 
    if (error) {
      return <AlertDismissible show={true} message={error} variant="danger"/>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <Table striped bordered hover>
        <thead>
          <th>#</th>
          <th>Analysis ID</th>
          <th>Timestamp</th>
          <th>Species</th>
          <th>Type</th>
          <th>Info</th>  
        </thead>
        <tbody>
        {items.map(item => {
          return (
            <tr>
              <td>{item.id}</td>
              <td>{item.anal_id}</td>
              <td>{item.time_stamp}</td>
              <td>{item.species_1}{item.integration === "True" ? "," + item.species_2 : ""}</td>
              <td>{item.integration === "True" ? "Integration": "Labels"}</td>
              <td><a href='/analysis/details'>Details</a></td>
            </tr>
          );
        })}
        </tbody>
      </Table>
      );
    }
    return (
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Analysis ID</th>
            <th>Timestamp</th>
            <th>Species</th>
            <th>Type</th>
            <th>Info</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>1c3cd4d5439b98ae8c6c3cbb79e50373</td>
            <td>15 May 2022, 8:12 PM</td>
            <td>Mouse, Marmoset</td>
            <td>Integrated</td>
            <td><Link to='/analysis/details'> Details </Link></td>
          </tr>
          <tr>
            <td>2</td>
            <td>ce7355062bc6dae3f2b799f38528a754</td>
            <td>13 May 2022, 7:15 PM</td>
            <td>Marmoset</td>
            <td>Single</td>
            <td><Link to='/analysis/details'> Details </Link></td>
          </tr>
          <tr>
            <td>3</td>
            <td>b2cd199fc9a322e60b23122910768fcd</td>
            <td>12 May 2022, 11:49 AM</td>
            <td>Human</td>
            <td>Single </td>
            <td><Link to='/analysis/details'> Details </Link></td>
          </tr>
        </tbody>
      </Table>
    );
  }
    
}

export default AnalysisAllRuns;
