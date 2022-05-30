import {Link} from 'react-router-dom'
import Table from 'react-bootstrap/Table'


function PrevRuns() {
    return (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Timestamp</th>
              <th>Species Name</th>
              <th>Status</th>
              <th>Info</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>15 May 2022, 8:12 PM</td>
              <td>Mouse</td>
              <td>Running</td>
              <td><Link to='/details'> Details </Link></td>
            </tr>
            <tr>
              <td>2</td>
              <td>13 May 2022, 7:15 PM</td>
              <td>Marmoset</td>
              <td>Finished</td>
              <td><Link to='/details'> Details </Link></td>
            </tr>
            <tr>
              <td>3</td>
              <td>12 May 2022, 11:49 AM</td>
              <td>Human</td>
              <td>Finished </td>
              <td><Link to='/details'> Details </Link></td>
            </tr>
          </tbody>
        </Table>
    );
}

export default PrevRuns;
