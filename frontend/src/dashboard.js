import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function Dashboard() {
    return (
        <Form className="w-responsive mx-auto p-3 mt-2">
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Common Name of the species</Form.Label>
            <Form.Control type="text" placeholder="marmoset" />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Location of raw reads</Form.Label>
            <Form.Control type="text" placeholder="raw_reads/marmoset/" />
            <Form.Text className="text-muted">
              Please make sure that this is a location on the server and not on your local machine.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check type="checkbox" label="Build transcriptome" />

            <Form.Label>Location of genome reads (.fa file)</Form.Label>
            <Form.Control type="text" placeholder="Callithrix_jacchus.mCalJac1.pat.X.dna.primary_assembly.fa" />

            <Form.Label>Location of gene annotations (.gtf file)</Form.Label>
            <Form.Control type="text" placeholder="Callithrix_jacchus.mCalJac1.pat.X.105.filtered.gtf" />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicResume">
            <Form.Check type="checkbox" label="Resume Previous run" />

            <Form.Label>Previous run id</Form.Label>
            <Form.Control type="text" placeholder="20220508-22:14:53-marmoset" />
          </Form.Group>

          <Button variant="primary" type="submit">
            Run the Pipeline!
          </Button>
        </Form>
    );
}

export default Dashboard;
