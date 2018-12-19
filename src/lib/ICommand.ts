export interface ICommand{

    key: string;
    icon?: string;
    label: string;
    onClick?: ( event ) => any;
    subItems?: ICommand[];
}
