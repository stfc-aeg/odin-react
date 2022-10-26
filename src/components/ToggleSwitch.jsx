import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';

import React, {useEffect, useState} from 'react';
// import './style.css';
import classNames from "classnames";

const BootstrapSwitchButton = ({
	checked: defaultChecked,
	onChange,
	disabled,
	onlabel,
	offlabel,
	onstyle,
	offstyle,
	size,
	className,
	width,
	height,
    label
}) => {
	const [checked, setChecked] = useState(defaultChecked);

	useEffect(() => {
		setChecked(defaultChecked);
	}, [defaultChecked]);

	const toggle = event => {
		if (!disabled) {
			const newState = !checked;
			console.log(newState);

			
			setChecked(newState);
			event.target.value = newState;
			console.log(event.target);
			onChange(event);
		}

		event.stopPropagation();
		event.persist();
	};

	let switchStyle = {};
	if (width) {
		switchStyle.width = width;
	}else{
        switchStyle.width = "50%";
    }
	if (height) {
		switchStyle.height = height + 'px';
	}

	let labelStyle = {};
	if (height) {
		labelStyle.lineHeight = 'calc(' + height + 'px * 0.8)';
	}

	return (
        <Row>
        <InputGroup.Text style={{textAlign: "center"}}>{label}</InputGroup.Text>
		<div
			className={classNames(
				'switch btn',
				(checked ? 'on btn-' + onstyle : 'off btn-' + offstyle),
				(size ? 'btn-' + size : ''),
				className || ''
			)}
			style={switchStyle}
			onClick={toggle}
		>
			<div className="switch-group">
				<span
					className={classNames(
						'switch-on btn',
						'btn-' + onstyle,
						(size ? 'btn-' + size : '')
					)}
					style={labelStyle}
					value={true}
				>
					{onlabel}
				</span>
				<span
					className={classNames(
						'switch-off btn',
						'btn-' + offstyle,
						(size ? 'btn-' + size : '')
					)}
					style={labelStyle}
					value={false}
				>
					{offlabel}
				</span>
				<span
					className={classNames(
						'switch-handle btn btn-light',
						(size ? 'btn-' + size : '')
					)}
				/>
			</div>
		</div>
        </Row>
	);
};

BootstrapSwitchButton.defaultProps = {
	checked: true,
	onChange: () => {},
	disabled: false,
	onlabel: 'On',
	offlabel: 'Off',
	onstyle: 'primary',
	offstyle: 'secondary',
	className: '',
};

export default BootstrapSwitchButton;