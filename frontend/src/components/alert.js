import React, { useState } from 'react';
import Alert from 'react-bootstrap/Alert';

class AlertDismissible extends React.Component {
    constructor(props) {
        super(props); 
    }

    render () {
            if (this.props.show) {
                return (
                    <Alert variant={this.props.variant} onClose={this.props.handler} dismissible>
                    {String(this.props.variant).localeCompare("success") === 0 ?
                        <> 
                            <Alert.Heading>Yay!</Alert.Heading>
                        </> : 
                        <> 
                            <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
                        </>
                    }
                    <p>
                        {this.props.message}
                    </p>
                </Alert>
                ); 
                
            }
            else {
                return (<p></p>); 
            }
    }
    
}

export default AlertDismissible; 