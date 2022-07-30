import {Link} from 'react-router-dom'
import Table from 'react-bootstrap/Table'


function AnalysisAllRuns() {
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

export default AnalysisAllRuns;
