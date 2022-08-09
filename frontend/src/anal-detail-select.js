import {Link} from 'react-router-dom'
import Card from 'react-bootstrap/Card'; 
import CardGroup from 'react-bootstrap/CardGroup';
import React from 'react';
import { useLocation } from 'react-router-dom';

const styles = {
    center: {
      marginLeft: "auto",
      marginRight: "auto"
    }
  }

function AnalysisDetailSelect() {
    const location = useLocation()
    const { hash, species_1, species_2 } = location.state; 

    console.log(hash); 

    return (
        <CardGroup className='w-responsive mx-auto p-3 mt-2'>
            <Card className="text-center">
                <Card.Img variant="top" className='mx-auto' style={{height: '300px', width: '300px'}} src="/images/chart.png" />
                <Card.Body>
                <Card.Title><Link to='/analysis/gallery'> Plots from the Pipeline </Link></Card.Title>
                <Card.Text>
                    Plots generated throughout the analysis of gene count matrix from upstream processes. 
                </Card.Text>
                </Card.Body>
            </Card>
            <Card className="text-center">
                <Card.Img variant="top" className='mx-auto' style={{height: '300px', width: '300px' }} src="/images/download.png" />
                <Card.Body>
                <Card.Title> <Link to={`/download/${hash}`}> Download Output files </Link></Card.Title>
                <Card.Text>
                    Download the plots and other files generated by the pipeline for downstream analysis. 
                </Card.Text>
                </Card.Body>
            </Card>
        </CardGroup>
    );
     
} 

export default AnalysisDetailSelect; 