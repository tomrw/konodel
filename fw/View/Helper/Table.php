<?php

class View_Helper_Table {
	
	public function display(array $headers, $rows) {

		$html = '<table><thead><tr>';

		foreach($headers as $header) {
			$html .= '<th>' . $header . '</th>';
		}

		$html .= '</tr></thead><tbody>';

		foreach($rows as $row) {
			$html .= '<tr>';

			/*if($row instanceof Database_Result_Object) {
				$row = $row->toArray();
			}*/

			foreach($row as $cell) {
				$html .= '<td>' . $cell . '</td>';
			}

			$html .= '</tr>';
		}

		$html .= '</tbody></table>';

		return $html;
	}
}