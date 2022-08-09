import {Link} from 'react-router-dom'
import Card from 'react-bootstrap/Card'; 
import CardGroup from 'react-bootstrap/CardGroup';
import Button from 'react-bootstrap/Button';

function Landing() {
    return (
        <CardGroup className='w-responsive mx-auto p-3 mt-2'>
            <Card className=" text-center">
                <Card.Img variant="top" className='mx-auto' style={{ height: '400px', width: '400px' }} src={"/images/genetic.png"} />
                <Card.Body>
                <Card.Title> Generate gene count matrix from fastq files </Card.Title>
                <Card.Text>
                    Process the raw fastq files for quality checks (FastQC) and align them to a reference transcriptome using 
                    cellranger. 
                </Card.Text>
                <Button variant="primary" href='/alignment'>Take me there!</Button>
                </Card.Body>
            </Card>
            <Card className="text-center" >
                <Card.Img variant="top" className='mx-auto' style={{ height: '400px', width: '400px' }} src="/images/clusters.png" />
                <Card.Body>
                <Card.Title> Integrative analysis, Clustering, Cell type identification etc. </Card.Title>
                <Card.Text>
                    Compare and analyse data from multiple species, cluster and label different cell types from the gene count matrices. 
                </Card.Text>
                <Button variant="primary" href='/analysis'>Take me there!</Button>
                </Card.Body>

            </Card>
        </CardGroup>
    ); 
}

export default Landing;
