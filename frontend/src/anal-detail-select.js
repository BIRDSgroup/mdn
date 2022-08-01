import {Link} from 'react-router-dom'
import Card from 'react-bootstrap/Card'; 
import CardGroup from 'react-bootstrap/CardGroup';

const styles = {
    center: {
      marginLeft: "auto",
      marginRight: "auto"
    }
  }

function AnalysisDetailSelect() {
    return (
        <CardGroup className={styles.center} style={{display: 'flex', justifyContent: 'center'}}>
            <Card>
                <Card.Img variant="top" style={{height: '400px', width: '400px'}} src="https://i.imgur.com/Nj3kyvu.png" />
                <Card.Body>
                <Card.Title><Link to='/analysis/gallery'> Plots from the Pipeline </Link></Card.Title>
                <Card.Text>
                    Plots generated throughout the analysis of gene count matrix from upstream processes. 
                </Card.Text>
                </Card.Body>
            </Card>
            <Card>
                <Card.Img variant="top" style={{height: '400px', width: '400px' }} src="https://media.istockphoto.com/vectors/download-icon-isolated-vector-vector-id844294300?k=20&m=844294300&s=612x612&w=0&h=Um3AUbTxB9AlQVK_0ykyr4UO3Yy6rcB0HII6HZbf28M=" />
                <Card.Body>
                <Card.Title> <Link to='/analysis/download'> Download Output files </Link></Card.Title>
                <Card.Text>
                    Download the plots and other files generated by the pipeline for downstream analysis. 
                </Card.Text>
                </Card.Body>
            </Card>
        </CardGroup>
    ); 
} 

export default AnalysisDetailSelect; 