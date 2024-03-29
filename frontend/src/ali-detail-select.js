import {Link} from 'react-router-dom'
import Card from 'react-bootstrap/Card'; 
import CardGroup from 'react-bootstrap/CardGroup';
import { useLocation } from 'react-router-dom';

function AlignDetailSelect() {
    const location = useLocation()
    const { hash, species } = location.state

    return (
        <CardGroup className='w-responsive mx-auto p-3 mt-2'>
            <Card className="text-center">
                <Card.Img variant="top" className='mx-auto' style={{height: '300px', width: '300px' }} src="/images/qc.png" />
                <Card.Body>
                <Card.Title> <Link target="_blank" to={`/output/${hash}/quality_control/marm027_S1_L001_R2_001_fastqc.html`}> FastQC report of raw reads </Link></Card.Title>
                <Card.Text>
                    Quality check reports for the raw reads as generated using FastQC. Reports show the evaluation 
                    of reads from both ends on various metrics. 
                </Card.Text>
                </Card.Body>
            </Card >
            <Card className="text-center">
                <Card.Img variant="top" className='mx-auto' style={{height: '300px', width: '300px' }} src="/images/10x-genomics.png" />
                <Card.Body>
                <Card.Title> <Link target="_blank" to={`/output/${hash}/${species}_cellranger/outs/web_summary.html`}>Cellranger report </Link></Card.Title>
                <Card.Text>
                    Html report generated during alignment and gene count matrix generation using cellranger. 
                </Card.Text>
                </Card.Body>
            </Card>
            <Card className="text-center">
                <Card.Img variant="top" className='mx-auto' style={{height: '300px', width: '300px' }} src="/images/download.png" />
                <Card.Body>
                <Card.Title><Link target="_blank" to={`/download/${hash}`}> Download Output files </Link></Card.Title>
                <Card.Text>
                    Download the gene count matrix, reports and other files generated by the pipeline for downstream analysis. 
                </Card.Text>
                </Card.Body>
            </Card>
        </CardGroup>
    ); 
} 

export default AlignDetailSelect; 