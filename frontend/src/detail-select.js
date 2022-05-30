import {Link} from 'react-router-dom'
import Card from 'react-bootstrap/Card'; 
import CardGroup from 'react-bootstrap/CardGroup';

function DetailSelect() {
    return (
        <CardGroup>
            <Card>
                <Card.Img variant="top" src="holder.js/100px160" />
                <Card.Body>
                <Card.Title>FastQC report of raw reads</Card.Title>
                <Card.Text>
                    Quality check reports for the raw reads as generated using FastQC. Reports show the evaluation 
                    of reads from both ends on various metrics. 
                </Card.Text>
                </Card.Body>
                <Card.Footer>
                <small className="text-muted">Last updated 3 mins ago</small>
                </Card.Footer>
            </Card>
            <Card>
                <Card.Img variant="top" src="holder.js/100px160" />
                <Card.Body>
                <Card.Title>Cellranger report</Card.Title>
                <Card.Text>
                    Html report generated during alignment and gene count matrix generation using cellranger. 
                </Card.Text>
                </Card.Body>
                <Card.Footer>
                <small className="text-muted">Last updated 3 mins ago</small>
                </Card.Footer>
            </Card>
            <Card>
                <Card.Img variant="top" src="holder.js/100px160" />
                <Card.Body>
                <Card.Title><Link to='/gallery'> Plots from the Pipeline </Link></Card.Title>
                <Card.Text>
                    Plots generated throughout the analysis of gene count matrix from upstream processes. 
                </Card.Text>
                </Card.Body>
                <Card.Footer>
                <small className="text-muted">Last updated 3 mins ago</small>
                </Card.Footer>
            </Card>
        </CardGroup>
    ); 
} 

export default DetailSelect; 