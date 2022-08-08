import {Link} from 'react-router-dom'
import Table from 'react-bootstrap/Table'
import React from 'react';
import AlertDismissible from './components/alert';


class AlignPrevRuns extends React.Component {
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
    fetch("http://localhost:5000/api/alignhistory")
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

  render () {
    const { error, isLoaded, items } = this.state;
    if (error) {
      return <AlertDismissible show={true} message={error} variant="danger"/>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        // <ul>
        //   {items.map(d => (
        //     <li key={d.run_id}>
        //       {d.run_id} {d.folder}
        //     </li>
        //   ))}
        // </ul>
        <Table striped bordered hover>
        <thead>
          <th>#</th>
          <th>Run ID</th>
          <th>Timestamp</th>
          <th>Species Name</th>
          <th>Status</th>
          <th>Info</th>  
        </thead>
        <tbody>
        {items.map(item => {
          return (
            <tr>
              <td>{item.id}</td>
              <td>{item.run_id}</td>
              <td>{item.time_stamp}</td>
              <td>{item.species}</td>
              <td>{item.run_status}</td>
              <td><Link to="/alignment/details" state={{hash: item.run_id, species: item.species}}>Details</Link></td>
            </tr>
          );
        })}
        </tbody>
      </Table>
      );
    }

    const data = [
      {id: 1, run_id: "ce020fd4c67c814d190ab89947a1ab4a", timestamp: "15 May 2022, 8:12 PM", species: "Mouse", status: "Running"}, 
      {id: 2, run_id: "9cb052a8d84c93f2070e09c2c13251f9", timestamp: "13 May 2022, 7:15 PM", species: "Marmoset", status: "Finished"}, 
      {id: 3, run_id: "7b3b9beac700db4bb8256b5aa2788004", timestamp: "12 May 2022, 11:49 AM", species: "Human", status: "Finished"},       
    ]
    return (
      <Table striped bordered hover>
        <thead>
          <th>#</th>
          <th>Run ID</th>
          <th>Timestamp</th>
          <th>Species Name</th>
          <th>Status</th>
          <th>Info</th>  
        </thead>
        <tbody>
        {data.map(item => {
          return (
            <tr>
              <td>{item.id}</td>
              <td>{item.run_id}</td>
              <td>{item.timestamp}</td>
              <td>{item.species}</td>
              <td>{item.status}</td>
              <td><a href='/alignment/details'>Details</a></td>
            </tr>
          );
        })}
        </tbody>
      </Table>
  );
  }
}

export default AlignPrevRuns;
